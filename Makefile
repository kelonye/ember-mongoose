test: node_modules
	@mocha -R dot test

node_modules:
	@npm install

.PHONY: test