// General settings are one global record, so this spec restores whatever it changes.

describe('API: general settings', () => {
  let original

  before(() => {
    cy.login()
    cy.api('GET', '/api/v1/settings/general').then(({ body }) => {
      original = body.data
    })
  })

  beforeEach(() => cy.login())

  after(() => {
    if (original) {
      cy.login()
      cy.api('PUT', '/api/v1/settings/general', original)
    }
  })

  it('reads the general settings', () => {
    cy.api('GET', '/api/v1/settings/general').then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.data).to.have.property('app.site_name')
      expect(body.data).to.have.property('app.lang')
      expect(body.data).to.have.property('app.timezone')
    })
  })

  it('persists a changed site name', () => {
    const siteName = `Libredesk ${Date.now()}`
    cy.api('PUT', '/api/v1/settings/general', { ...original, 'app.site_name': siteName })
      .its('status')
      .should('eq', 200)

    cy.api('GET', '/api/v1/settings/general').then(({ body }) => {
      expect(body.data['app.site_name']).to.eq(siteName)
    })
  })

  it('rejects an unknown timezone', () => {
    cy.api('PUT', '/api/v1/settings/general', { ...original, 'app.timezone': 'Not/AZone' }, {
      failOnStatusCode: false
    }).its('status').should('be.gte', 400)
  })
})
