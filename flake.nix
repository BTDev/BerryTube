{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    flake-utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };

    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, gitignore, ... }: {
    nixosModules.default = import ./module.nix;
    overlays.default = final: prev: {
      berrytube-frontend = self.packages.${prev.system}.frontend;
      berrytube-backend = self.packages.${prev.system}.backend;
      berrytube-dbinit = self.packages.${prev.system}.dbinit;
    };
  } // flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};
      nodejs = pkgs.nodejs-16_x;
      inherit (gitignore.lib) gitignoreSource;
    in
    {
      packages.frontend = pkgs.stdenv.mkDerivation {
        name = "berrytube-frontend";
        src = gitignoreSource ./web;
        buildPhase = "";
        installPhase = ''
          mkdir -p "$out"
          cp -r * "$out"
        '';
      };

      packages.backend = pkgs.mkYarnPackage {
        name = "berrytube-backend";
        src = gitignoreSource ./docker/node;
        packageJSON = ./docker/node/package.json;
        yarnLock = ./docker/node/yarn.lock;
        inherit nodejs;
      };

      packages.dbinit = pkgs.writeShellApplication {
        name = "berrytube-dbinit";
        runtimeInputs = with pkgs; [ mysql ];
        text = ''
          while read -r fname; do
            echo "Running $(basename "$fname")" >&2
            mysql <"$fname"
          done < <(find '${./docker/mysql/updates.d}' -name '*.sql' | sort)
        '';
      };

      devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [ 
          nodejs
          (yarn.override { inherit nodejs; })
          docker-compose
         ];
      };
    });
}
