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

void Network::form_request(int type)
{
    // fills the request struct with the appropriate information
    int request_length;
    switch (type) {
    case Network::REQUEST_REGISTER:
        request_length = req_register();
        break;
    case Network::REQUEST_LOGIN:
        request_length = req_login();
        break;
    case Network::REQUEST_LOGOUT:
        request_length = req_logout();
        break;
    case Network::REQUEST_HOSTGAME:
        request_length = req_hostgame();
        break;
    case Network::REQUEST_JOINGAME:
        request_length = req_joingame();
        break;
    case Network::REQUEST_SPECTATE:
        request_length = req_spectate();
        break;
    case Network::REQUEST_LEAVE:
        request_length = req_leave();
        break;
    case Network::REQUEST_UPDATE:
        request_length = req_update();
        break;
    case Network::REQUEST_PLAY:
        request_length = req_play();
        break;
    case Network::REQUEST_MESSAGE:
        request_length = req_message();
        break;
    case Network::REQUEST_SCORE:
        request_length = req_score();
        break;
    case Network::REQUEST_RENEW:
        request_length = req_renew();
        break;
    }

    sprintf(outgoing_buffer + buffer_offset,
           "%d\r\n\r\n%s",
           request_length,
           temp_buffer);
    printf("request message generated:\n%s\n", outgoing_buffer);
}

int Network::make_request()
{
    if (!connection_live) {
        reconnect();
    }

    int bytes = send(local_socket, outgoing_buffer, strlen(outgoing_buffer), 0);

    if (bytes == SOCKET_ERROR){
        printf("FAILURE SENDING REQUEST: %d\n", WSAGetLastError());
        return Network::SEND_FAILURE;
    } else {
        printf("%d bytes sent to server\n", bytes);
    }
    return Network::NETWORK_SUCCESS;
}

int Network::req_register()
{
    int bytes = sprintf(temp_buffer,
                        "type=register&username=%s&password=%s&country=%s",
                        ui_component::USERNAME_BUFFER,
                        ui_component::PASSWORD_BUFFER,
                        ui_component::COUNTRY_BUFFER);
    return bytes;
}

int Network::req_login()
{
    int bytes = sprintf(temp_buffer,
                        "type=login&username=%s&password=%s",
                        ui_component::USERNAME_BUFFER,
                        ui_component::PASSWORD_BUFFER);
    return bytes;
}

int Network::req_logout()//unfinished
{
    int bytes = sprintf(temp_buffer,
                        "type=logout&authentication_code=%d",
                        ui_component::authentication_code);
    return bytes;
}

int Network::req_hostgame()//unfinished
{
    std::string color;
    switch (ui_component::currentGame.host_color()){
    case Game::player_black:
        color = "black";
        break;
    case Game::player_white:
        color = "white";
        break;
    case Game::player_random:
        color = "random";
        break;
    }

    int bytes = sprintf(temp_buffer,
                        "type=host&authentication_code=%d&size=%dx%d&host_color=%s&timer=%d min %%2B %d sec&spectator_on=%d",
                        ui_component::authentication_code,
                        ui_component::currentGame.size(),
                        ui_component::currentGame.size(),
                        color.c_str(),
                        ui_component::currentGame.timer_total(),
                        ui_component::currentGame.timer_inc(),
                        ui_component::currentGame.spectator_on());
    return bytes;
}

int Network::req_joingame()//unfinished
{
    int id = ui_component::SELECTED_GAME + ui_component::SELECTED_PAGE * 10;
    //printf("id = %d\n", id);
    int bytes = sprintf(temp_buffer,
                        "type=join&authentication_code=%d&game_id=%d",
                        ui_component::authentication_code,
                        ui_component::GAME_LIST[id].id_);
    return bytes;
}

int Network::req_spectate()//unfinished
{
    int id = ui_component::SELECTED_GAME + ui_component::SELECTED_PAGE * 10;
    //printf("id = %d\n", id);
    int bytes = sprintf(temp_buffer,
                        "type=spectate&authentication_code=%d&game_id=%d",
                        ui_component::authentication_code,
                        ui_component::GAME_LIST[id].id_);
    return bytes;
}

int Network::req_leave()
{

    int bytes = sprintf(temp_buffer,
                        "type=leave&authentication_code=%d",
                        ui_component::authentication_code);

    return bytes;
}

int Network::req_ready()
{
    // this function has been rendered redundant by the req_score function
    // to be removed later on.
    // However, I do believe that using the user_score request for
    // multiple functions violated the principle that functions
    // should have a clear and separate responsibility.
}

int Network::req_update()//unfinished
{
    int bytes;
    if (ui_component::mode == ui_const::UI_LOBBY) {
        bytes = sprintf(temp_buffer,
                        "type=update&authentication_code=%d&stamp=%s",
                        ui_component::authentication_code,
                        ui_component::lobby_stamp.c_str());
    } else {
        bytes = sprintf(temp_buffer,
                        "type=update&authentication_code=%d&stamp=%s",
                        ui_component::authentication_code,
                        ui_component::game_stamp.c_str());
    }
    return bytes;
}

int Network::req_play()//unfinished
{
    int bytes = sprintf(temp_buffer,
                        "type=play&authentication_code=%d&action=%d&stamp=%s",
                        ui_component::authentication_code,
                        ui_component::currentAction,
                        ui_component::game_stamp.c_str());
    return bytes;
}

int Network::req_message()//unfinished
{
    int bytes;

    if (ui_component::mode == ui_const::UI_LOBBY){
        bytes = sprintf(temp_buffer,
                        "type=message&authentication_code=%d&message=k[%s]: %s&stamp=%s",
                        ui_component::authentication_code,
                        ui_component::currentUser.c_str(),
                        ui_component::MESSAGE_BUFFER,
                        ui_component::lobby_stamp.c_str());
    } else {
        bytes = sprintf(temp_buffer,
                        "type=message&authentication_code=%d&message=k[%s]: %s&stamp=%s",
                        ui_component::authentication_code,
                        ui_component::currentUser.c_str(),
                        ui_component::MESSAGE_BUFFER,
                        ui_component::game_stamp.c_str());
    }
    return bytes;
}

int Network::req_score()
{
    int val, black, white;
    black = ui_component::currentGame.score_black();
    white = ui_component::currentGame.score_white();
    if ((ui_component::currentGame.host_color() == Game::player_white) ^
        (ui_component::currentGame.status() == Game::status_host)) {
        val = black < 0 ? black : black * 362 + white;
    } else {
        val = white < 0 ? white : black * 362 + white;
    }

    int bytes = sprintf(temp_buffer,
                        "type=score&authentication_code=%d&score=%d",
                        ui_component::authentication_code,
                        val);
    return bytes;
}

int Network::req_renew()
{
    int bytes = sprintf(temp_buffer,
                        "type=renew");
    return bytes;
}
