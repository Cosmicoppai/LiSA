import ssl
import socket

hostname = "i1.mangakatana.com"

ctx = ssl._create_unverified_context()

with socket.create_connection((hostname, 443)) as sock:
    with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
        print("Cipher:", ssock.cipher())
        print("Peer certificate:")
        print(ssock.getpeercert())