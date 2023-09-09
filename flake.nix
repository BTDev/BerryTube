{
  inputs = {
    nixpkgs.url = "nixpkgs";

    flake-utils.url = "flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { self, nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
        config.permittedInsecurePackages = [
          "nodejs-16.20.2"
        ];
      };
      nodejs = pkgs.nodejs-16_x;
    in
    {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          nodejs
          (yarn.override { inherit nodejs; })
          docker-compose
          php
        ];
      };
    });
}
