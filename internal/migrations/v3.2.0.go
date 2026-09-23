package migrations

import (
	_ "embed"
	"github.com/jmoiron/sqlx"
	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
)

//go:embed remove_tags.sql
var removeTagsSQL string

// V3_2_0 removes tags and their saved filter predicates.
func V3_2_0(db *sqlx.DB, fs stuffbin.FileSystem, ko *koanf.Koanf) error {
	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(removeTagsSQL); err != nil {
		return err
	}
	return tx.Commit()
}
