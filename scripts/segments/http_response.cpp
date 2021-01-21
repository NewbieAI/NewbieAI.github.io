void Network::get_response()
{
    int byte;
    int bytes_read;
    char *ptr;
    while ((byte = recv(local_socket, incoming_buffer, buffer_size, 0)) > 0) {
        /*
        expecting = -1: expecting header. reads an entire line
        expecting = 0: expecting a chunk, reads an entire line
        expecting > 0: expecting response body, reads as many bytes as available
        */

        //printf("%d bytes received\n", byte);
        //printf("%s\n", incoming_buffer);

        ptr = incoming_buffer;
        while (ptr < incoming_buffer + byte){
            //printf("expecting = %d\n", expecting);
            if (expecting > 0) {
                // reads as many bytes as available, increment ptr by the amount read
                bytes_read = expecting > incoming_buffer + byte - ptr ? incoming_buffer + byte - ptr : expecting;
                expecting -= bytes_read;

                response += std::string(ptr, bytes_read - (expecting >= 2 ? 0 : 2 - expecting));

                ptr += bytes_read;

            } else if (expecting == 0) {

                // read until CRLF symbol, get the size of the next chunk.
                while (ptr < incoming_buffer + byte && *ptr != '\n') {
                    if (*ptr != '\r') {
                        chunk_size = (chunk_size << 4) + (*ptr < 'a' ? *ptr - '0' : 10 + *ptr - 'a');
                    }
                    ptr++;
                }

                if (ptr < incoming_buffer + byte) {
                    if (chunk_size) {
                        // received a non-zero chunk
                        // proceed to expect the chunk
                        //printf("chunk_size = %d\n", chunk_size);

                        expecting = chunk_size + 2;
                        chunk_size = 0;
                    } else {
                        parse_response();
                        expecting = -1;
                        ptr += 2;
                    }
                    ptr++;
                }

            } else {
                // read a line until CRLF. if line is empty, start
                // expecting a response body.

                while (ptr < incoming_buffer + byte && *ptr != '\n') {
                    header_line++;
                    ptr++;
                }
                if (ptr < incoming_buffer + byte) {

                    if (header_line == 1){
                        expecting = 0;
                    }
                    //printf("header line length: %d\t", header_line);
                    header_line = 0;
                    ptr++;
                }
            }

        }
    }
    if (byte == 0) {
        connection_live = false;
    }
}

void show_response()
{
    // function only used for debugging
    using namespace Network;
    printf("\nResponse:\n");
    for (std::string::size_type x = 0; x < response.size(); x++) {
        if (response[x] == '\0'){
            printf("\\0");
        } else if (response[x] == '\r') {
            printf("\\r");
        } else {
            printf("%c", response[x]);
        }
    }
    printf("\n\n");
}

void Network::parse_response()
{
    using namespace ui_component;

    show_response();
    has_changed = true;
    // first reads which response it is for
    std::string::size_type i = 0;
    int has_update = 0;
    auto next = [&i](char delimiter)
    {
        int j = response.find(delimiter, i);
        std::string s = response.substr(i, j - i);
        i = j + 1;
        //std::cout << "debug: s = " << s << std::endl;
        return s;
    };

    switch (std::stoi(next('='))){
    case REQUEST_REGISTER:
        if (std::stoi(next('\0'))){
            sys_message = "Registration success!";
        } else {
            sys_message = "Registration failure!";
        }

        break;
    case REQUEST_LOGIN:
        if (std::stoi(next('\0'))){
            sys_message = "Login success!";
            mode = ui_const::UI_LOBBY;
            ui_render::set_background(ui_const::UI_BACKGROUND_LOBBY);
            SELECTED_BUFFER = MESSAGE_BUFFER;
            SELECTED_BUFFER_PTR = &MESSAGE_PTR;
            SELECTED_FIELD = ui_const::UI_FIELD_LOBBY_MESSAGE;
            next('=');
            authentication_code = std::stoi(next('\0'));
            next('=');
            has_update = std::stoi(next('\0'));

        } else {
            sys_message = "Login failure!";
        }
        break;
    case REQUEST_LOGOUT:
        if (std::stoi(next('\0'))){

            currentUser = "";
            authentication_code = -1;
            mode = ui_const::UI_START;
            LOBBY_MESSAGE_OFFSET = 0;
            *SELECTED_BUFFER_PTR = 0;
            SELECTED_BUFFER[0] = '\0';
            SELECTED_BUFFER = USERNAME_BUFFER;
            SELECTED_BUFFER_PTR = &USERNAME_PTR;
            SELECTED_FIELD = ui_const::UI_FIELD_NAME_LOGIN;
            ui_render::set_background(ui_const::UI_BACKGROUND_START);
            sys_message = "You have logged out.";

        } else {

        }
        break;
    case REQUEST_HOSTGAME:
        if (std::stoi(next('\0'))){
            //printf("hosting game response received...\n");
            IS_OPTION_ON = false;
            mode = ui_const::UI_GAME;
            GAME_MESSAGE_OFFSET = 0;
            *SELECTED_BUFFER_PTR = 0;
            SELECTED_BUFFER[0] = '\0';
            next('=');
            has_update = std::stoi(next('\0'));
        } else {

        }
        break;
    case REQUEST_JOINGAME:
        if (std::stoi(next('\0'))){
            // successful joining the game;

            mode = ui_const::UI_GAME;
            GAME_MESSAGE_OFFSET = 0;
            *SELECTED_BUFFER_PTR = 0;
            SELECTED_BUFFER[0] = '\0';
            next('=');
            has_update = std::stoi(next('\0'));

        } else {

        }
        break;
    case REQUEST_SPECTATE:
        if (std::stoi(next('\0'))){
            // successful spectating the game

            mode = ui_const::UI_GAME;
            GAME_MESSAGE_OFFSET = 0;
            *SELECTED_BUFFER_PTR = 0;
            SELECTED_BUFFER[0] = '\0';
            next('=');
            has_update = std::stoi(next('\0'));

        } else {

        }
        break;
    case REQUEST_LEAVE:
        if (std::stoi(next('\0'))){
            mode = ui_const::UI_LOBBY;
            LOBBY_MESSAGE_OFFSET = 0;
            *SELECTED_BUFFER_PTR = 0;
            SELECTED_BUFFER[0] = '\0';
            next('=');
            has_update = std::stoi(next('\0'));
        } else {

        }
        break;
    case REQUEST_READY:
        if (std::stoi(next('\0'))){

        } else {

        }
        break;
    case REQUEST_UPDATE:
        if (std::stoi(next('\0'))){
            // successful update
            has_update = true;
        } else {
            // failed update, retry connection?
            Network::reconnect();
        }
        break;
    case REQUEST_PLAY:
        if (std::stoi(next('\0'))){
            next('=');
            has_update = std::stoi(next('\0'));
        } else {

        }
        break;
    case REQUEST_MESSAGE:
        if (std::stoi(next('\0'))){
            next('=');
            has_update = std::stoi(next('\0'));
        } else {

        }
        break;
    case REQUEST_SCORE:
        if (std::stoi(next('\0'))){

        } else {

        }
        break;
    case REQUEST_RENEW:
        if (std::stoi(next('\0'))){

        } else {

        }
        break;
    }

    if (has_update) {
        std::string s;
        if (mode == ui_const::UI_LOBBY) {
            // load ongoing games
            GAME_LIST.clear();
            PLAYER_LIST.clear();

            next('=');
            lobby_stamp = next('\0');

            next('=');
            int game_count = std::stoi(next('\0'));


            Game_Descriptor cur;
            for (int i = 0; i < game_count; i++) {

                cur.id_ = std::stoi(next('\r'));
                cur.player_count = std::stoi(next('\r'));
                s = next('\r');
                cur.gamehost_[s.copy(cur.gamehost_, 32)] = '\0';
                s = next('\r');
                cur.opponent_[s.copy(cur.opponent_, 32)] = '\0';
                s = next('\r');
                cur.size_[s.copy(cur.size_, 10)] = '\0';
                s = next('\r');
                cur.color_[s.copy(cur.color_, 10)] = '\0';
                s = next('\r');
                cur.timer_[s.copy(cur.timer_, 20)] = '\0';
                s = next('\r');
                cur.status_[s.copy(cur.status_, 10)] = '\0';
                s = next('\r');
                cur.spectator_on[s.copy(cur.spectator_on, 5)] = '\0';
                GAME_LIST.push_back(cur);
                next('\0');
            }

            //print_games();
            // load current players
            next('=');
            int player_count = std::stoi(next('\0'));
            Player p;

            for (int i = 0; i < player_count; i++){
                s = next('\r');
                p.name_[s.copy(p.name_, 32)] = '\0';

                p.win_ = std::stoi(next('\r'));
                p.loss_ = std::stoi(next('\r'));

                s = next('\r');
                p.country_[s.copy(p.country_, 32)] = '\0';

                next('\0');
                PLAYER_LIST.push_back(p);
            }

            //print_users();
            // remember to modify the count
            // load all new messages
            next('=');
            int message_count = std::stoi(next('\0'));

            for (int i = 0; i < message_count; i++) {
                ui_event::appendMessage(&LOBBY_MESSAGE_BOARD,
                                        next('\0'),
                                        1.225);
            }

            if (LOBBY_MESSAGE_OFFSET) {
                LOBBY_MESSAGE_OFFSET += message_count;
            }

        } else {
            PLAYER_LIST.clear();
            // load the players
            next('=');
            std::string moves = next(':');
            game_stamp = moves + ":" + next('\0');
            int move_number = std::stoi(moves);

            // updates game information such has host_color_
            // in case game status changes, host leaves, or
            // opponent changes
            currentGame.set_hostname(next('\r'));
            currentGame.set_opponent(next('\r'));
            currentGame.set_playerblack(next('\r'));
            currentGame.set_playerwhite(next('\r'));

            if (currentGame.status() == Game::status_player &&
                currentGame.hostname() == currentUser) {
                currentGame.setStatus(Game::status_host);
            }
            next('\0');


            next('=');
            int player_count = std::stoi(next('\0'));
            printf("%d players found\n\n", player_count);

            Player p;
            for (int i = 0; i < player_count; i++) {
                s = next('\r');
                p.name_[s.copy(p.name_, 32)] = '\0';

                p.win_ = std::stoi(next('\r'));
                p.loss_ = std::stoi(next('\r'));

                s = next('\r');
                p.country_[s.copy(p.country_, 32)] = '\0';

                PLAYER_LIST.push_back(p);
                next('\0');
            }

            // load the new moves

            next('=');
            int move_count = std::stoi(next('\0'));

            if (currentGame.moves() + move_count == move_number) {
                for (int i = 0; i < move_count; i++) {
                    printf("\tloading new move!\n");
                    if (currentGame.is_uptodate()) {
                        // revise this section for rule change


                        currentGame.play(std::stoi(next('\0')));
                    } else {
                        currentGame.queue_move(std::stoi(next('\0')));
                    }
                }
            }

            // load new messages
            next('=');
            int message_count = std::stoi(next('\0'));
            printf("%d messages received\n\n", message_count);

            for (int i = 0; i < message_count; i++) {
                ui_event::appendMessage(&GAME_MESSAGE_BOARD,
                                        next('\0'),
                                        0.85);
            }

            if (GAME_MESSAGE_OFFSET) {
                GAME_MESSAGE_OFFSET += message_count;
            }


            if (move_number == (int)currentGame.moves()) {

                // game has started, start the timer
                // in this version server does not respond
                // where the timer needs to be stopped
                if (move_number % 2) {
                    // white's turn
                    currentGame.timer_white()->stop();
                    currentGame.timer_black()->start();

                } else {
                    // black's turn
                    currentGame.timer_black()->stop();
                    currentGame.timer_white()->start();

                }

            } else {

                // this section will be deleted after
                // everything starts working.
                printf("\nGame NOT Started\n");
                printf("server moves %d != local_moves %d\n",
                       move_number,
                       currentGame.moves());
            }

        }
    }
    response.clear();
}
