This project uses an experimental architecture. The core idea is that each module that is responsible for logic contains an entire vertical slice of its functionality, from "ui" to persistance layer. Communication between modules is entirely mediated though async command and query objects, ala CQRS. It is reasonable to think of each module as an in-process microservice. In fact, splitting each module into their own processes should be a straightforward thing to do if the need ever arises.

The objects that represent the data model of the system, or `Entities`, are used as nothing more than dumb DTOs, and are entirely owned by the module that defines them. The module that provides them will also provide any functionality on top of that part of the data model, accessible via commands. Other modules, however, may attach additional data to Entities not owned by them.

The project is split into the following concepts:

# Library

Library code is self contained shared infrastructure used in the project.

## Shapes

Shapes provide a runtime and compile time definition of complex object structures, with additional metadata. They can
be used as type guards, runtime validators, and runtime form generation.

# Services

Services are berrytube-specific libraries that provide functionality to all layers below.

## Logging

Simple structured logging.

## Database

Basic access to a mysql instance.

## Entities

Entities are bags of properties. Modules may register entity types. Only the owning module may create, delete, or modify an entity. However, other modules may attach additional properties to existing entities to store additional data. An example would be a `UserColor` module attaching a color property to the `User` entity provided by a separate module.

It is also used to extend the root entities. For example, the `Playlist` module may attach its "root" Playlist data to the `Server` entity that is referenced directly by the engine. The additional `Playlist` data would, in turn, reference the `PlaylistItem` entities that are created by the `Playlist` module.

## Injection

Basic service injection stuff.

# Engine

The engine is a combination of the services above. It also exposes root entities to be attached to by the modules below.

# Modules

All of the application logic is provided by services. A service exposes the following things:

-   Entities
-   Entity Data
-   Queries
    -   Async messages that are handled by the module that defines them. Unlike commands, they must return data back to their caller.
-   Commands
    -   Async messages that are handled by the module that defines them.

Modules are never interactive with directly. Inter-module communication is handled exclusivity though async, serializable, channels.

Modules directly depend on the services that they require.

## Security

## Playlist

## Polls
