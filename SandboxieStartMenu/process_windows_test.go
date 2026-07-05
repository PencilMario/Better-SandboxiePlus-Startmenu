//go:build windows

package main

import "testing"

func TestHiddenCommandSuppressesConsoleWindow(t *testing.T) {
	cmd := hiddenCommand("cmd", "/c", "exit")

	if cmd.SysProcAttr == nil {
		t.Fatal("SysProcAttr = nil, want HideWindow enabled")
	}
	if !cmd.SysProcAttr.HideWindow {
		t.Fatal("HideWindow = false, want true")
	}
}
