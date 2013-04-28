SRC = $(shell find src -name "*.coffee" -type f)
LIB = $(SRC:src/%.coffee=lib/%.js)

TEST_CLIENT_COFFEE = $(shell find test/client/src -name "*.coffee" -type f)
TEST_CLIENT_JS = $(TEST_CLIENT_COFFEE:test/client/src/%.coffee=test/client/lib/%.js)

test: test_server test_client

test_server: node_modules lib $(LIB)
	@mocha --compilers coffee:coffee-script -R dot test/server/

test_client: build test/client/lib $(TEST_CLIENT_JS) test/client/support/index.html
	@mocha-phantomjs -R dot test/client/support/index.html

test/client/lib:
	@mkdir -p $@

test/client/support/index.html: test/client/support/index.jade
	jade < $< > $@

test/client/lib/%.js: test/client/src/%.coffee
	coffee -bcj $@ $<

build: node_modules components lib $(LIB)
	@component build --dev

node_modules:
	@npm install

components:
	@component install --dev

lib:
	@mkdir -p lib

lib/%.js: src/%.coffee
	coffee -bcj $@ $<

clean:
	@rm -rf build lib test/client/lib test/client/support/index.html

.PHONY: clean test test_server test_client