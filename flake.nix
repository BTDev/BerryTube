{
  inputs = {
    nixpkgs.url = "nixpkgs";

    flake-utils.url = "flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
      };
      node-major = pkgs.lib.versions.major (pkgs.lib.removePrefix "v" (builtins.readFile ./.nvmrc));
      nodejs = pkgs."nodejs_${node-major}";
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
