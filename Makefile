test: node_modules
	@mocha -R dot test

node_modules:
	@npm install

publish:
	@npm publish

clean:
	@rm -rf public

.PHONY: clean test