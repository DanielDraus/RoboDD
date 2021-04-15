from __future__ import print_function

from os import chdir
from os.path import abspath, dirname, join

try:
    from SocketServer import ThreadingMixIn
    from BaseHTTPServer import HTTPServer
    from SimpleHTTPServer import SimpleHTTPRequestHandler
except ImportError:
    from socketserver import ThreadingMixIn
    from http.server import SimpleHTTPRequestHandler, HTTPServer

ROOT = join(dirname(abspath(__file__)), 'html')
PORT = 7272


class DemoServer(ThreadingMixIn, HTTPServer):
    allow_reuse_address = True

    def __init__(self, port=PORT):
        HTTPServer.__init__(self, ('localhost', int(port)),
                            SimpleHTTPRequestHandler)

    def serve(self, directory=ROOT):
        chdir(directory)
        print('Demo server starting on port %d.' % self.server_address[1])
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            server.server_close()
        print('Demo server stopped.')


if __name__ == '__main__':
    import sys
    # try:
    #     from webdrivermanager import GeckoDriverManager
    #     gdd = GeckoDriverManager()
    #     print(gdd.get_download_path())
    #     print(gdd.get_download_url())
    #     print(gdd.get_driver_filename())
    #     print(gdd.download_and_install())
    #
    # except Exception as ex:
    #     raise
    #     pass
    try:
        server = DemoServer(*sys.argv[1:])
    except (TypeError, ValueError):
        print(__doc__)
    else:
        server.serve()