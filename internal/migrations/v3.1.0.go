package migrations

import (
	_ "embed"
	"github.com/jmoiron/sqlx"
	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
)

//go:embed remove_notifications.sql
var removeNotificationsSQL string

// V3_1_0 removes notification storage and preserves account recovery email configuration.
func V3_1_0(db *sqlx.DB, fs stuffbin.FileSystem, ko *koanf.Koanf) error {
	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(removeNotificationsSQL); err != nil {
		return err
	}
	return tx.Commit()
}
