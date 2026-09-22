//go:build windows

package resourceusage

import "errors"

func collectFilesystemUsage(string) (uint64, uint64, error) {
	return 0, 0, errors.New("filesystem usage is unavailable on windows")
}
