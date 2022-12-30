{ pkgs, lib, config, ... }:

let
  cfg = config.services.berrytube;
  nodejs =  pkgs.nodejs-16_x;
in
{
  options.services.berrytube = {
    enable = lib.mkEnableOption "berrytube";

    user = lib.mkOption {
      type = lib.types.str;
      default = "berrytube";
    };

    group = lib.mkOption {
      type = lib.types.str;
      default = "berrytube";
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "localhost";
    };

    legacySocketPort = lib.mkOption {
      type = lib.types.port;
      default = 8344;
    };

    serve = lib.mkOption {
      type = lib.types.submodule {
        options = {
          cdn = lib.mkOption {
            type = lib.types.bool;
            default = true;
          };

          minified = lib.mkOption {
            type = lib.types.bool;
            default = true;
          };
        };
      };
      default = { };
    };

    youtube = lib.mkOption {
      type = lib.types.submodule {
        options = {
          key = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
        };
      };
      default = { };
    };

    soundcloud = lib.mkOption {
      type = lib.types.submodule {
        options = {
          clientId = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
          clientSecret = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
        };
      };
      default = { };
    };

    maxmind = lib.mkOption {
      type = lib.types.submodule {
        options = {
          key = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
        };
      };
      default = { };
    };

    discord = lib.mkOption {
      type = lib.types.submodule {
        options = {
          botToken = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
          guildId = lib.mkOption {
            type = lib.types.str;
            default = "130763680160677888";
          };
        };
      };
      default = { };
    };

    twitch = lib.mkOption {
      type = lib.types.submodule {
        options = {
          clientId = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
          clientSecret = lib.mkOption {
            type = lib.types.str;
            default = "";
          };
        };
      };
      default = { };
    };
  };

  config = lib.mkIf cfg.enable {
    users.users."${cfg.user}" = {
      isSystemUser = lib.mkDefault true;
      group = cfg.group;
    };
    users.groups."${cfg.group}" = { };
    users.users.${config.services.nginx.user}.extraGroups = [ cfg.group ];

    systemd.services.berrytube-backend = {
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" "mysql.service" ];
      wants = [ "mysql.service" ];
      serviceConfig = {
        User = cfg.user;
        Group = cfg.group;
        ExecStartPre = "${pkgs.berrytube-dbinit}/bin/berrytube-dbinit";
        ExecStart = "${pkgs.berrytube-backend}/bin/berrytube";
        Restart = "on-failure";
      };
      environment = {
        BERRYTUBE_LISTEN_PORT = "/run/berrytube-backend.sock";
        YOUTUBE_APIKEY = cfg.youtube.key;
        SOUNDCLOUD_CLIENT_ID = cfg.soundcloud.clientId;
        SOUNDCLOUD_CLIENT_SECRET = cfg.soundcloud.clientSecret;
        TWITCH_CLIENT_ID = cfg.twitch.clientId;
        TWITCH_CLIENT_SECRET = cfg.twitch.clientSecret;
      };
    };

    services.phpfpm.pools.${cfg.user} = {
      user = cfg.user;
      group = cfg.group;
      phpPackage = pkgs.php74.withExtensions (ps: with ps; [ pdo_mysql mysqli json ]);
      phpOptions = ''
        session.cookie_secure = true
        session.cookie_httponly = true
      '';
      phpEnv = {
        DOMAIN = cfg.domain;
        HTTP_PORT = config.services.nginx.defaultHTTPListenPort;
        HTTPS_PORT = config.services.nginx.defaultSSLListenPort;
        NO_CDN = builtins.toString (!cfg.serve.cdn);
        NO_MINIFIED = builtins.toString (!cfg.serve.minified);
        DISCORD_BOT_TOKEN = cfg.discord.botToken;
        DISCORD_GUILD_ID = cfg.discord.guildId;
      };
    };
    services.phpfpm.pools."${cfg.user}-extra" = {
      user = cfg.user;
      group = cfg.group;
      phpPackage = pkgs.php74.withExtensions (ps: with ps; [ pdo_mysql mysqli json ]);
      phpOptions = ''
        session.cookie_secure = true
        session.cookie_httponly = true
      '';
      phpEnv = {
        DOMAIN = cfg.domain;
        HTTP_PORT = config.services.nginx.defaultHTTPListenPort;
        HTTPS_PORT = config.services.nginx.defaultSSLListenPort;
        NO_CDN = builtins.toString (!cfg.serve.cdn);
        NO_MINIFIED = builtins.toString (!cfg.serve.minified);
      };
    };

    services.nginx = {
      appendHttpConfig = ''
        map $arg_app $btc_port {
          default 0;
          ponypen 9990;
          canvas 9991;
          shotbutton 9992;
          wutcolors 9993;
        }
      '';
      virtualHosts."www.${cfg.domain}" = {
        locations."/".return = "301 https://${cfg.domain}$request_uri";
      };
      virtualHosts.${cfg.domain} = {
        index = ["index.html" "index.php"];
        locations."~* \.php$".extraConfig = ''
          fastcgi_pass unix:${services.phpfpm.pools.${cfg.user}.socket};
        '';
      };
      virtualHosts."socket.${cfg.domain}" = {
        locations."/".proxyPass = "http://unix:/run/berrytube-backend.sock";
      };
      virtualHosts."legacy-socket.${cfg.domain}" = {
        listen = [{ port = cfg.legacySocketPort; }];
        default = true;
        locations."/".proxyPass = "http://unix:/run/berrytube-backend.sock";
      };
      virtualHosts."cdn.${cfg.domain}" = {
        locations."/sha1/".extraConfig = ''
          rewrite ^/sha1/[^/]+/(.+)$ /$1 break;
        '';
        locations."/berrymotes/images/".extraConfig = ''
        '';
        locations."/berrymotes/data/".extraConfig = ''
          gzip_static on;
        '';
      };
      virtualHosts."btc.${cfg.domain}" = {
        index = ["index.html" "index.php"];
        locations."~* \.php$".extraConfig = ''
          fastcgi_pass unix:${services.phpfpm.pools."${cfg.user}-extra".socket};
        '';
      };
      virtualHosts."btc-socket.${cfg.domain}" = {
        extraConfig = ''
          if ($btc_port = 0) {
              return 404;
          }
        '';
        locations."/".proxyPass = "http://localhost:$btc_port";
      };
      virtualHosts."keyblade.${cfg.domain}" = {
        locations."/".return = "302 https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      };
    };

    services.mysql = {
      ensureUsers = [{
        name = cfg.user;
        ensurePermissions = {
          "${cfg.user}.*" = "ALL PRIVILEGES";
        };
      }];
      initialDatabases = [{
        name = cfg.user;
        schema = lib.concatText "init.sql" [ ./docker/mysql/initdb.d/01-schema.sql ./docker/mysql/initdb.d/02-initvals.sql ];
      }];
    };
  };
}
