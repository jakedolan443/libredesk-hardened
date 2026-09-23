package migrations

import (
	_ "embed"
	"github.com/jmoiron/sqlx"
	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
)

//go:embed mail_only.sql
var mailOnlySQL string

// V3_0_0 removes retired helpdesk data without deleting email messages or sender identities.
func V3_0_0(db *sqlx.DB, fs stuffbin.FileSystem, ko *koanf.Koanf) error {
	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(mailOnlySQL); err != nil {
		return err
	}
	return tx.Commit()
}
