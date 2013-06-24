test: node_modules
	@mocha -R dot test/server

node_modules:
	@npm install

components:
	@component install --dev

public: components
	@component build --dev -n $@ -o $@

clean:
	@rm -rf public

.PHONY: clean test