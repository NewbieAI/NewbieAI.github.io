#define _WIN32_WINNT 0x0501 //this is for XP

#include "networkmanager.h"
#include "uimanager.h"
#include "game.h"
#include <ws2tcpip.h>
#include <stdio.h>
#include <iostream>
#include <string>

WSAData Network::wsa_data;
SOCKET Network::local_socket;
struct addrinfo *Network::dns_result = NULL;

char Network::outgoing_buffer[Network::buffer_size];
char Network::incoming_buffer[Network::buffer_size];
char Network::temp_buffer[Network::buffer_size];
int Network::buffer_offset;
std::string Network::response = "";
int Network::expecting = -1;
int Network::chunk_size = 0;
int Network::header_line = 0;
bool Network::connection_live;

int Network::initialize()
{
    int status;
    WORD version = MAKEWORD(2, 2);
    status = WSAStartup(version, &wsa_data);
    if (status) {
        return WSASTARTUP_FAILURE;
    }
    printf("WSA STARTUP SUCCESSFUL\n");


    struct addrinfo hint;
    ZeroMemory(&hint, sizeof(hint));
    hint.ai_family = AF_INET;
    hint.ai_socktype = SOCK_STREAM;
    hint.ai_protocol = IPPROTO_TCP;

    int retVal = getaddrinfo(__SERVER__, __PORT__, &hint, &dns_result);
    if (retVal != 0){
        unwind();
        return DNS_LOOKUP_FAILURE;
    }

    struct sockaddr_in *remote = (struct sockaddr_in*)dns_result->ai_addr;
    printf("IP address: %s\n", inet_ntoa(remote->sin_addr));
    printf("Port: %d\n", ntohs(remote->sin_port));

    buffer_offset = sprintf(outgoing_buffer, "POST / HTTP/1.1\r\nHost: tlsiejkjwiiiils.dx.am\r\nConnection: keep-alive\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: ");

    if (reconnect() == SOCKET_ERROR){
        unwind();
        return CONNECTION_FAILURE;
    }
    printf("Connected to %s at port %s\n", __SERVER__, __PORT__);

    return NETWORK_SUCCESS;
}

void Network::unwind()
{
    freeaddrinfo(dns_result);
    closesocket(local_socket);
    WSACleanup();
    printf("network unwinding\n");
}

int Network::reconnect()
{
    // attempt to reconnect to the server here.
    closesocket(local_socket);
    local_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (local_socket == INVALID_SOCKET) {
        printf("FAILED TO CREATE SOCKET: %d\n", WSAGetLastError());
        return SOCKET_ERROR;
    }

    int connectResult = connect(local_socket, dns_result->ai_addr, dns_result->ai_addrlen);

    if (connectResult == 0) {
        printf("CONNECTION SUCCESS\n");
    } else {
        printf("CONNECTION FAILURE: %d\n", WSAGetLastError());
        return SOCKET_ERROR;
    }
    ioctlsocket(local_socket, FIONBIO, (u_long*)&nonblocking);
    connection_live = true;
    return 0;
}
