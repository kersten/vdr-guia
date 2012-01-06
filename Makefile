build:

install:
	install -d $(DESTDIR)/usr/share/vdr-guia/
	install -d $(DESTDIR)/etc/init/
	
	@npm config set registry http://registry.npmjs.org/
	@npm install --prefix $(CURDIR)

	cp -r node_modules $(DESTDIR)/usr/share/vdr-guia/

	install -m 644 upstart/vdr-guia.conf $(DESTDIR)/etc/init/
	cp -r src/* $(DESTDIR)/usr/share/vdr-guia/

clean:
