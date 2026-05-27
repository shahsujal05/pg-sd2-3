describe('Database page', function() {
    it('check the database page contains expected data', function(browser) {
        browser
            .useXpath()
            .navigateTo('http://localhost:3000/db_test')
            .assert.textContains('/html/body/pre', 'Kimia');
    });
});