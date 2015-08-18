test: node_modules
	@DEBUG=em:*,app:* mocha -R dot test

node_modules:
	@npm install

.PHONY: test