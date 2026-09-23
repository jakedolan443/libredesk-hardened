package stringutil

import (
	"testing"
)

func TestRemoveItemByValue(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		remove   string
		expected []string
	}{
		{
			name:     "empty slice",
			input:    []string{},
			remove:   "a",
			expected: []string{},
		},
		{
			name:     "no matches",
			input:    []string{"b", "c"},
			remove:   "a",
			expected: []string{"b", "c"},
		},
		{
			name:     "single match",
			input:    []string{"a", "b", "c"},
			remove:   "b",
			expected: []string{"a", "c"},
		},
		{
			name:     "multiple matches",
			input:    []string{"a", "b", "a", "c", "a"},
			remove:   "a",
			expected: []string{"b", "c"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := RemoveItemByValue(tt.input, tt.remove)
			if len(result) != len(tt.expected) {
				t.Errorf("got len %d, want %d", len(result), len(tt.expected))
			}
			for i := range result {
				if result[i] != tt.expected[i] {
					t.Errorf("at index %d got %s, want %s", i, result[i], tt.expected[i])
				}
			}
		})
	}
}

func TestExtractConvUUID(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected string
	}{
		{
			name:     "valid UUID v4",
			email:    "support+conv-13216cf7-6626-4b0d-a938-46ce65a20701@domain.com",
			expected: "13216cf7-6626-4b0d-a938-46ce65a20701",
		},
		{
			name:     "uppercase UUID v4",
			email:    "support+conv-13216CF7-6626-4B0D-A938-46CE65A20701@domain.com",
			expected: "13216CF7-6626-4B0D-A938-46CE65A20701",
		},
		{
			name:     "no plus addressing",
			email:    "support@domain.com",
			expected: "",
		},
		{
			name:     "non-conv plus addressing",
			email:    "support+other@domain.com",
			expected: "",
		},
		{
			name:     "short non-UUID (user email)",
			email:    "support+conv-21321@domain.com",
			expected: "",
		},
		{
			name:     "invalid UUID format",
			email:    "support+conv-abc123-def456@domain.com",
			expected: "",
		},
		{
			name:     "missing 4 in UUID (invalid v4)",
			email:    "support+conv-13216cf7-6626-ab0d-a938-46ce65a20701@domain.com",
			expected: "",
		},
		{
			name:     "empty string",
			email:    "",
			expected: "",
		},
		{
			name:     "missing @ symbol",
			email:    "support+conv-13216cf7-6626-4b0d-a938-46ce65a20701",
			expected: "",
		},
		{
			name:     "UUID with extra chars",
			email:    "support+conv-13216cf7-6626-4b0d-a938-46ce65a20701-extra@domain.com",
			expected: "",
		},
		{
			name:     "valid UUID different local part",
			email:    "inbox+conv-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d@example.org",
			expected: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ExtractConvUUID(tt.email)
			if result != tt.expected {
				t.Errorf("ExtractConvUUID(%q) = %q, want %q", tt.email, result, tt.expected)
			}
		})
	}
}

func TestSanitizeUTF8(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"empty", "", ""},
		{"plain ascii unchanged", "Hello, world!", "Hello, world!"},
		{"valid copyright unchanged", "© 2026", "© 2026"},
		{"orphan 0xa9 replaced", "\xa9 2026 Upstox", "� 2026 Upstox"},
		{"nul stripped", "a\x00b", "ab"},
		{"chinese unchanged", "你好世界", "你好世界"},
		{"devanagari unchanged", "नमस्ते", "नमस्ते"},
		{"arabic unchanged", "مرحبا", "مرحبا"},
		{"emoji unchanged", "ok 😀👍", "ok 😀👍"},
		{"accented latin unchanged", "café résumé", "café résumé"},
		{"run of invalid bytes collapses to one replacement", "x\xa9\xa9y", "x�y"},
		{"truncated 3-byte char replaced", "\xe4\xbd", "�"},
		{"lead byte at end replaced", "abc\xc3", "abc�"},
		{"overlong encoding replaced", "x\xc0\x80y", "x�y"},
		{"cp1252 smart quotes replaced", "\x93hi\x94", "�hi�"},
		{"multiple embedded nuls stripped", "a\x00\x00b\x00c", "abc"},
		{"nul and invalid byte combined", "a\x00\xa9b", "a�b"},
		{"valid multibyte preserved around invalid byte", "a你\xa9好b", "a你�好b"},
		{"bom preserved", "\ufeffhi", "\ufeffhi"},
		{"existing replacement char preserved", "a�b", "a�b"},
		{"crlf and tab preserved", "l1\r\nl2\t", "l1\r\nl2\t"},
		{"paired continuation kept, orphan replaced", "é\xa9", "é�"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := SanitizeUTF8(tt.input); got != tt.expected {
				t.Errorf("SanitizeUTF8(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestSanitizeFilename(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"plain ascii", "report.pdf", "report.pdf"},
		{"case preserved", "Report.PDF", "Report.PDF"},
		{"cyrillic preserved", "Документ_Иванов.pdf", "Документ_Иванов.pdf"},
		{"chinese with space", "报告 2024.xlsx", "报告-2024.xlsx"},
		{"spaces collapse to hyphen", "my  file name.txt", "my-file-name.txt"},
		{"path traversal", "../../etc/passwd", "passwd"},
		{"windows path stripped to base name", `dir\sub\file.txt`, "file.txt"},
		{"control chars stripped", "a\r\nb\x00c.pdf", "a-bc.pdf"},
		{"empty", "", "attachment"},
		{"whitespace only", "   ", "attachment"},
		{"dot only", ".", "attachment"},
		{"dot dot", "..", "attachment"},
		{"slash only", "/", "attachment"},
		{"slashes only", "///", "attachment"},
		{"backslash only", `\`, "attachment"},
		{"c1 control stripped", "a\u0085b.pdf", "ab.pdf"},
		{"invalid utf8 replaced", "rapport\xe9.pdf", "rapport�.pdf"},
		{"emoji preserved", "photo😀.jpg", "photo😀.jpg"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := SanitizeFilename(tt.input); got != tt.expected {
				t.Errorf("SanitizeFilename(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestSplitName(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantFirst string
		wantLast  string
	}{
		{name: "empty", input: "", wantFirst: "", wantLast: ""},
		{name: "whitespace only", input: "   ", wantFirst: "", wantLast: ""},
		{name: "single name", input: "Cher", wantFirst: "Cher", wantLast: ""},
		{name: "first and last", input: "John Doe", wantFirst: "John", wantLast: "Doe"},
		{name: "middle name", input: "John Michael Doe", wantFirst: "John", wantLast: "Michael Doe"},
		{name: "multi-word surname", input: "Ludwig van der Berg", wantFirst: "Ludwig", wantLast: "van der Berg"},
		{name: "extra spaces", input: "  John   Doe  ", wantFirst: "John", wantLast: "Doe"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			first, last := SplitName(tt.input)
			if first != tt.wantFirst || last != tt.wantLast {
				t.Errorf("SplitName(%q) = (%q, %q), want (%q, %q)", tt.input, first, last, tt.wantFirst, tt.wantLast)
			}
		})
	}
}

func TestNormalizeMessageID(t *testing.T) {
	for _, tc := range []struct {
		name, in, want string
	}{
		{"bracketed", "<abc@example.com>", "abc@example.com"},
		{"already bare", "abc@example.com", "abc@example.com"},
		{"surrounding whitespace", "  <abc@example.com>  ", "abc@example.com"},
		{"empty stays empty", "", ""},
		{"brackets only", "<>", ""},
		{"line feed is rejected", "a\nb@example.com", ""},
		{"carriage return is rejected", "a\rb@example.com", ""},
		{"crlf inside brackets is rejected", "<a\r\nb@host>", ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := NormalizeMessageID(tc.in); got != tc.want {
				t.Errorf("NormalizeMessageID(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}
