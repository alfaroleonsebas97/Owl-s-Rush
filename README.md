# Proyecto: Owl's Rush


CI137 Desarrollo de Aplicaciones Web - I Semestre 2021

Integrantes:
- Juan José Garro Núñez B83249
- Bruno Alejandro Conejo Soto B82273
- Sebastián Alfaro León B60210 

Este proyecto consiste en una adaptación, en versión de sitio Web, del juego [*Hoot Owl Hoot*](https://www.amazon.com/-/es/Juego-mesa-cooperativo-Peaceable-Kingdom/dp/B004HVKAAI) con fines académicos, sin fines de lucro, para el curso de Desarrollo de Aplicaciones Web de la Universidad de Costa Rica.

![Tablero de Owl's Rush](design/Board.svg)

## Adaptaciones al juego original de *Hoot Owl Hool*:

1. Se implementan características similares al juego *Parchís*:
    1. El juego es competitivo, gana el que lleve primero todas sus fichas a la meta.
    2. Cada jugador tiene sus propias fichas, entre 1 y 5 según la configuración previa a la partida.
    3. Mínimo 2 jugadores, máximo 4.
    4. El tablero es similar al del juego [*Parchis STAR*](https://play.google.com/store/apps/details?id=com.superking.parchisi.star&hl=es_CR&gl=US)
    5. Las fichas de cada jugador inician en una esquina asignada.
2. Cada jugador posee entre 1 y 3 cartas en mano, según la configuración previa a la partida.
3. Se cambia el comportamiento del sol:
    1. El ciclo del sol se completa con 4 cartas de sol.
    2. El ciclo del sol es compartido por todos los jugadores.
    3. El jugador que complete el ciclo del sol debe retroceder al punto de partida su ficha más próxima a la meta.
    4. El ciclo del sol se reinicia cada vez que se completa.
4. Existen algunas cartas comodines que dan ventajas:
    1. Carta *X2*: carta que permite al jugador jugar dos turnos seguidos.
    2. Carta *Rainbow*: carta que vale por cualquier color.
    3. Carta *Rollback* (**tentativa**): carta que devuelve una ficha, a elección, de otro jugador a la casilla en la que estuvo anteriormente.
    4. Carta *Swap* (**tentativa**): intercambia la posición entre la ficha a elección del jugador y la ficha más proxima perteneciente a otro jugador.
5. **Adaptación tentativa**, se puede configurar previa al juego alguna de las dos opciones: 
    1. Se pueden saltar las fichas de otros jugadores.
    2. No se pueden saltar las fichas de otros jugadores, si se va a mover una ficha hacia una casilla ocupada por una ficha de otro jugador, las fichas afectadas intercambian su posición.
