// Package stringutil provides string utility functions.
package stringutil

import (
	"crypto/rand"
	"fmt"
	"net/mail"
	"path"
	"regexp"
	"strings"
	"time"

	"github.com/inbucket/html2text"
)

const (
	PasswordDummy = "•"
)

var (
	regexpUnsafeFileChars = regexp.MustCompile(`[\x00-\x1f\x7f\x{80}-\x{9f}]+`)
	regexpSpaces          = regexp.MustCompile(`[\s]+`)
	uuidV4Regex           = regexp.MustCompile(`[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}`)
	regexpConvUUID        = regexp.MustCompile(`(?i)\+conv-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}@`)
)

// SanitizeUTF8 removes NUL bytes and replaces invalid UTF-8 byte sequences with the Unicode replacement character.
func SanitizeUTF8(s string) string {
	if s == "" {
		return s
	}
	s = strings.ReplaceAll(s, "\x00", "")
	return strings.ToValidUTF8(s, "�")
}

// HTML2Text converts HTML to plain text, dropping link URLs.
func HTML2Text(html string) string {
	return htmlToText(html, html2text.Options{TextOnly: true})
}

// SanitizeFilename removes control characters and path separators, preserving Unicode.
func SanitizeFilename(fName string) string {
	name := strings.TrimSpace(SanitizeUTF8(fName))
	name = path.Base(strings.ReplaceAll(name, `\`, "/"))
	name = regexpSpaces.ReplaceAllString(name, "-")
	name = regexpUnsafeFileChars.ReplaceAllString(name, "")
	if name == "" || name == "." || name == ".." || name == "/" {
		return "attachment"
	}
	return name
}

// RandomAlphanumeric generates a random alphanumeric string of length n.
func RandomAlphanumeric(n int) (string, error) {
	const dictionary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	bytes := make([]byte, n)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	for k, v := range bytes {
		bytes[k] = dictionary[v%byte(len(dictionary))]
	}

	return string(bytes), nil
}

// RemoveEmpty removes empty strings from a slice of strings.
func RemoveEmpty(s []string) []string {
	var r []string
	for _, str := range s {
		if str != "" {
			r = append(r, str)
		}
	}
	return r
}

// NormalizeMessageID strips surrounding whitespace and the optional angle brackets from an RFC 5322 Message-ID, and rejects values containing line breaks (which would produce malformed In-Reply-To/References headers). source_id is stored unbracketed; BuildEmailThreadingHeaders re-adds the brackets when composing them.
func NormalizeMessageID(id string) string {
	id = strings.Trim(strings.TrimSpace(id), "<>")
	if strings.ContainsAny(id, "\r\n") {
		return ""
	}
	return id
}

// GenerateEmailMessageID generates an RFC-compliant Message-ID for an email without angle brackets.
func GenerateEmailMessageID(uuid string, fromAddress string) (string, error) {
	if uuid == "" {
		return "", fmt.Errorf("uuid cannot be empty")
	}

	// Parse from address
	addr, err := mail.ParseAddress(fromAddress)
	if err != nil {
		return "", fmt.Errorf("invalid from address: %w", err)
	}

	// Extract domain with validation
	parts := strings.Split(addr.Address, "@")
	if len(parts) != 2 || parts[1] == "" {
		return "", fmt.Errorf("invalid domain in from address")
	}
	domain := parts[1]

	// Random component
	randomStr, err := RandomAlphanumeric(11)
	if err != nil {
		return "", fmt.Errorf("failed to generate random string: %w", err)
	}

	return fmt.Sprintf("%s-%d-%s@%s",
		uuid,
		time.Now().UnixNano(),
		randomStr,
		domain,
	), nil
}

// RemoveItemByValue removes all instances of a value from a slice of strings.
func RemoveItemByValue(slice []string, value string) []string {
	result := []string{}
	for _, v := range slice {
		if v != value {
			result = append(result, v)
		}
	}
	return result
}

// ValidEmail returns true if it's a valid email else return false.
func ValidEmail(email string) bool {
	addr, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}
	return addr.Name == "" && addr.Address == email
}

// ExtractEmail extracts the email address from a string.
// E.g. "Name <john@example.com>" -> "john@example.com", "john@example.com" -> "john@example.com".
func ExtractEmail(s string) (string, error) {
	addr, err := mail.ParseAddress(s)
	if err != nil {
		return "", err
	}
	return addr.Address, nil
}

// ExtractConvUUID extracts the conversation UUID from a plus-addressed email.
// e.g., support+conv-abc12345-1234-4123-1234-123456789abc@domain.com -> abc12345-1234-4123-1234-123456789abc
// Returns empty string if no valid UUIDv4 found.
func ExtractConvUUID(email string) string {
	match := regexpConvUUID.FindString(email)
	if match == "" {
		return ""
	}
	// match is "+conv-{uuid}@", extract just the UUID (skip "+conv-" prefix and "@" suffix)
	return match[6 : len(match)-1]
}

// ExtractUUID finds and returns the first valid UUID v4 in the given text.
// Returns empty string if no valid UUID is found.
func ExtractUUID(text string) string {
	return uuidV4Regex.FindString(text)
}

// SplitName splits a full name; the first word is the first name, the rest is the last name.
func SplitName(name string) (string, string) {
	fields := strings.Fields(name)
	if len(fields) == 0 {
		return "", ""
	}
	if len(fields) == 1 {
		return fields[0], ""
	}
	return fields[0], strings.Join(fields[1:], " ")
}

func htmlToText(html string, opts html2text.Options) string {
	out, err := html2text.FromString(html, opts)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(out)
}
