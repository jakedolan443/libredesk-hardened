import { describe, test, expect } from 'vitest'
import { createFormSchema } from './formSchema'

const mockT = (key, params) => `${key} ${JSON.stringify(params || {})}`
const schema = createFormSchema(mockT)

const validForm = {
  name: 'New reply',
  body: '<p>Hello</p>',
  type: 'email_outgoing',
  subject: 'You have a new reply'
}

describe('Templates Form Schema', () => {
  test('valid complete form', () => {
    expect(() => schema.parse(validForm)).not.toThrow()
  })

  test('name missing', () => {
    const { name, ...form } = validForm
    expect(() => schema.parse(form)).toThrow()
  })

  test('name not a string', () => {
    expect(() => schema.parse({ ...validForm, name: 1 })).toThrow()
  })

  test('body missing', () => {
    const { body, ...form } = validForm
    expect(() => schema.parse(form)).toThrow()
  })

  test('body not a string', () => {
    expect(() => schema.parse({ ...validForm, body: null })).toThrow()
  })

  test('subject optional for outgoing email templates', () => {
    const { subject, ...form } = validForm
    expect(() => schema.parse(form)).not.toThrow()
  })

  test('empty subject allowed for outgoing email templates', () => {
    expect(() => schema.parse({ ...validForm, subject: '' })).not.toThrow()
  })

  test('subject optional for email_outgoing templates', () => {
    expect(() =>
      schema.parse({ name: 'Outgoing', body: '<p>x</p>', type: 'email_outgoing' })
    ).not.toThrow()
  })

  test('retired notification template type rejected', () => {
    expect(() =>
      schema.parse({ name: 'Reply notification', body: '<p>x</p>', type: 'email_notification' })
    ).toThrow()
  })

  test('type optional', () => {
    expect(() => schema.parse({ name: 'x', body: 'y', subject: 'z' })).not.toThrow()
  })

  test('is_default defaults to false', () => {
    expect(schema.parse(validForm).is_default).toBe(false)
  })

  test('is_default must be boolean', () => {
    expect(() => schema.parse({ ...validForm, is_default: 'true' })).toThrow()
  })

  test('empty object', () => {
    expect(() => schema.parse({})).toThrow()
  })
})
