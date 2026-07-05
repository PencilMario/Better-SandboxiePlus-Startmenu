package main

import (
	"errors"
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestGetConfiguredSandboxesQueriesSbieIni(t *testing.T) {
	var gotName string
	var gotArgs []string
	sm := &SandboxieManager{
		sbieIniPath: "SbieIni.exe",
		commandOutput: func(name string, args ...string) ([]byte, error) {
			gotName = name
			gotArgs = args
			return []byte("DefaultBox\r\nAyase\r\n\r\nDefaultBox\r\n"), nil
		},
	}

	boxes, err := sm.GetConfiguredSandboxes()
	if err != nil {
		t.Fatalf("GetConfiguredSandboxes() error = %v", err)
	}

	if gotName != "SbieIni.exe" {
		t.Fatalf("command name = %q, want SbieIni.exe", gotName)
	}
	if !reflect.DeepEqual(gotArgs, []string{"query", "/boxes", "*"}) {
		t.Fatalf("command args = %#v", gotArgs)
	}

	want := []string{"DefaultBox", "Ayase"}
	if !reflect.DeepEqual(boxes, want) {
		t.Fatalf("boxes = %#v, want %#v", boxes, want)
	}
}

func TestGetConfiguredSandboxesRequiresSbieIni(t *testing.T) {
	sm := &SandboxieManager{}

	_, err := sm.GetConfiguredSandboxes()
	if err == nil {
		t.Fatal("GetConfiguredSandboxes() error = nil, want error")
	}
}

func TestGetConfiguredSandboxesPropagatesCommandErrors(t *testing.T) {
	sm := &SandboxieManager{
		sbieIniPath: "SbieIni.exe",
		commandOutput: func(name string, args ...string) ([]byte, error) {
			return nil, errors.New("boom")
		},
	}

	_, err := sm.GetConfiguredSandboxes()
	if err == nil {
		t.Fatal("GetConfiguredSandboxes() error = nil, want error")
	}
}

func TestMergeDetectedSandboxesPrefersDetectedAndKeepsAsk(t *testing.T) {
	got := mergeDetectedSandboxes(
		[]string{"DefaultBox", "Ayase"},
		[]string{"DefaultBox", "__ask__", "ManualOnly"},
	)
	want := []string{"DefaultBox", "Ayase", "__ask__"}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("merged boxes = %#v, want %#v", got, want)
	}
}

func TestMergeDetectedSandboxesFallsBackToManualList(t *testing.T) {
	got := mergeDetectedSandboxes(nil, []string{"DefaultBox", "__ask__", "ManualOnly"})
	want := []string{"DefaultBox", "__ask__", "ManualOnly"}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("merged boxes = %#v, want %#v", got, want)
	}
}

func TestResolveAvailableSandboxesMarksAutoDetection(t *testing.T) {
	boxes, autoDetected := resolveAvailableSandboxes(
		[]string{"DefaultBox", "Ayase"},
		[]string{"DefaultBox", "__ask__", "ManualOnly"},
	)

	if !autoDetected {
		t.Fatal("autoDetected = false, want true")
	}

	want := []string{"DefaultBox", "Ayase", "__ask__"}
	if !reflect.DeepEqual(boxes, want) {
		t.Fatalf("boxes = %#v, want %#v", boxes, want)
	}
}

func TestResolveAvailableSandboxesMarksManualFallback(t *testing.T) {
	boxes, autoDetected := resolveAvailableSandboxes(
		nil,
		[]string{"DefaultBox", "__ask__", "ManualOnly"},
	)

	if autoDetected {
		t.Fatal("autoDetected = true, want false")
	}

	want := []string{"DefaultBox", "__ask__", "ManualOnly"}
	if !reflect.DeepEqual(boxes, want) {
		t.Fatalf("boxes = %#v, want %#v", boxes, want)
	}
}

func TestGetSandboxRootFoldersQueriesFileRootPathAndExpandsPlaceholders(t *testing.T) {
	t.Setenv("USERNAME", "Alice")
	t.Setenv("SystemDrive", "C:")

	sm := &SandboxieManager{
		sbieIniPath: "SbieIni.exe",
		commandOutput: func(name string, args ...string) ([]byte, error) {
			if reflect.DeepEqual(args, []string{"query", "/boxes", "*"}) {
				return []byte("DefaultBox\r\nAyase\r\n"), nil
			}
			if reflect.DeepEqual(args, []string{"query", "DefaultBox", "FileRootPath"}) {
				return []byte(""), nil
			}
			if reflect.DeepEqual(args, []string{"query", "Ayase", "FileRootPath"}) {
				return []byte(`K:\Sandboxes\%SANDBOX%` + "\r\n"), nil
			}
			t.Fatalf("unexpected command args: %#v", args)
			return nil, nil
		},
	}

	folders, err := sm.GetSandboxRootFolders()
	if err != nil {
		t.Fatalf("GetSandboxRootFolders() error = %v", err)
	}

	want := []SandboxFolder{
		{Sandbox: "DefaultBox", Path: `C:\Sandbox\Alice\DefaultBox`},
		{Sandbox: "Ayase", Path: `K:\Sandboxes\Ayase`},
	}
	if !reflect.DeepEqual(folders, want) {
		t.Fatalf("folders = %#v, want %#v", folders, want)
	}
}

func TestFilterUnaddedSandboxFoldersHidesExistingFolders(t *testing.T) {
	existingPath := filepath.Clean(`C:\Sandbox\Alice\DefaultBox`)
	folders := []SandboxFolder{
		{Sandbox: "DefaultBox", Path: existingPath},
		{Sandbox: "Ayase", Path: filepath.Clean(`K:\Sandboxes\Ayase`)},
	}
	existing := []string{existingPath + string(os.PathSeparator)}

	got := filterUnaddedSandboxFolders(folders, existing)
	want := []SandboxFolder{{Sandbox: "Ayase", Path: filepath.Clean(`K:\Sandboxes\Ayase`)}}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("folders = %#v, want %#v", got, want)
	}
}
