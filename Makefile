
build.js: components
	@component build --out . --name build

components: component.json
	@component install

clean:
	rm -rf build.js components

.PHONY: clean
