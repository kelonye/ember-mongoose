component = ./node_modules/.bin/component
folder = test/support/client/app/components

test: node_modules
	@DEBUG=em:*,app:* mocha -R dot test

example: node_modules components
	@mkdir -p $(folder)/kelonye-ember-mongoose/
	@cp -rf components/* $(folder)
	@cp -f component.json $(folder)/kelonye-ember-mongoose/
	@cp -rf lib $(folder)/kelonye-ember-mongoose/
	@DEBUG=em:*,app:* node test/support/server/run.js

node_modules:
	@npm install

components:
	@$(component) install

.PHONY: test