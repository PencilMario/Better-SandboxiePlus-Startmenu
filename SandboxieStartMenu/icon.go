package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"sync"
	"unsafe"

	"github.com/lxn/win"
	"golang.org/x/sys/windows"
)

// 定义 SHFILEINFO 结构体
type SHFILEINFO struct {
	HIcon         windows.Handle
	IIcon         int32
	DwAttributes  uint32
	SzDisplayName [windows.MAX_PATH]uint16
	SzTypeName    [80]uint16
}

const (
	SHGFI_ICON      = 0x00000100 // 获取图标句柄
	SHGFI_LARGEICON = 0x00000000 // 获取大图标 (32x32)
	SHGFI_SMALLICON = 0x00000001 // 获取小图标 (16x16)
)

var (
	shell32       = windows.NewLazySystemDLL("shell32.dll")
	shGetFileInfo = shell32.NewProc("SHGetFileInfoW")
	user32        = windows.NewLazySystemDLL("user32.dll")
	destroyIcon   = user32.NewProc("DestroyIcon")

	// 图标缓存
	iconCache = make(map[string]string)
	cacheMu   sync.RWMutex
)

// GetFileIconBase64 获取文件图标并返回base64编码的PNG
// 如果图标提取失败，返回空字符串，前端将使用Unicode图标
func GetFileIconBase64(filePath string) string {
	// 检查缓存
	cacheMu.RLock()
	if cached, ok := iconCache[filePath]; ok {
		cacheMu.RUnlock()
		return cached
	}
	cacheMu.RUnlock()

	// 获取图标句柄
	hIcon, err := getFileIconHandle(filePath)
	if err != nil {
		return ""
	}
	defer destroyIcon.Call(uintptr(hIcon))

	// 转换为PNG
	pngData, err := hIconToPNG(hIcon)
	if err != nil {
		return ""
	}

	// 编码为base64
	result := "data:image/png;base64," + base64.StdEncoding.EncodeToString(pngData)

	// 缓存结果
	cacheMu.Lock()
	iconCache[filePath] = result
	cacheMu.Unlock()

	return result
}

// getFileIconHandle 获取文件的图标句柄
func getFileIconHandle(path string) (windows.Handle, error) {
	var shfi SHFILEINFO
	pathPtr, err := windows.UTF16PtrFromString(path)
	if err != nil {
		return 0, err
	}

	// 调用 SHGetFileInfo
	ret, _, _ := shGetFileInfo.Call(
		uintptr(unsafe.Pointer(pathPtr)),
		0,
		uintptr(unsafe.Pointer(&shfi)),
		uintptr(unsafe.Sizeof(shfi)),
		SHGFI_ICON|SHGFI_LARGEICON,
	)

	if ret == 0 {
		// 尝试小图标
		ret, _, _ = shGetFileInfo.Call(
			uintptr(unsafe.Pointer(pathPtr)),
			0,
			uintptr(unsafe.Pointer(&shfi)),
			uintptr(unsafe.Sizeof(shfi)),
			SHGFI_ICON|SHGFI_SMALLICON,
		)

		if ret == 0 {
			return 0, fmt.Errorf("failed to get icon for: %s", path)
		}
	}

	return shfi.HIcon, nil
}

// hIconToPNG 将HICON转换为PNG数据
func hIconToPNG(hIcon windows.Handle) ([]byte, error) {
	// 转换为Go的image.Image
	img, err := hIconToImage(win.HICON(hIcon))
	if err != nil {
		return nil, err
	}

	// 编码为PNG
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// hIconToImage 将Windows的HICON句柄转换为Go的image.Image
func hIconToImage(hIcon win.HICON) (image.Image, error) {
	var iconInfo win.ICONINFO
	if !win.GetIconInfo(hIcon, &iconInfo) {
		return nil, fmt.Errorf("GetIconInfo failed")
	}
	defer win.DeleteObject(win.HGDIOBJ(iconInfo.HbmColor))
	defer win.DeleteObject(win.HGDIOBJ(iconInfo.HbmMask))

	var bm win.BITMAP
	win.GetObject(win.HGDIOBJ(iconInfo.HbmColor), unsafe.Sizeof(bm), unsafe.Pointer(&bm))

	width := int(bm.BmWidth)
	height := int(bm.BmHeight)

	hdc := win.GetDC(0)
	defer win.ReleaseDC(0, hdc)

	memHdc := win.CreateCompatibleDC(hdc)
	defer win.DeleteDC(memHdc)

	// 创建位图信息头
	var bi win.BITMAPINFOHEADER
	bi.BiSize = uint32(unsafe.Sizeof(bi))
	bi.BiWidth = bm.BmWidth
	bi.BiHeight = -bm.BmHeight // 负值表示自上而下
	bi.BiPlanes = 1
	bi.BiBitCount = 32
	bi.BiCompression = win.BI_RGB

	// 分配像素缓冲区
	pixels := make([]byte, width*height*4)
	win.GetDIBits(hdc, iconInfo.HbmColor, 0, uint32(height), (*byte)(unsafe.Pointer(&pixels[0])), (*win.BITMAPINFO)(unsafe.Pointer(&bi)), win.DIB_RGB_COLORS)

	// 转换为Go的RGBA图像
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			i := (y*width + x) * 4
			// BGRA 转 RGBA
			img.Set(x, y, color.RGBA{
				R: pixels[i+2],
				G: pixels[i+1],
				B: pixels[i],
				A: pixels[i+3],
			})
		}
	}
	return img, nil
}