package application.controller;

import abstraction.IGameInterface;
import common.InvalidPositionException;
import common.GameState;
import main.GameMain;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * GameController class - interacts with the backend logic.
 * New game instances are created here.
 **/
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {
    private IGameInterface game;

    /**
     * Method to create new game instance
     **/
    @GetMapping("/newGame")
    public void handleNewGame(){
        System.out.println("New Game");
        this.game = new GameMain();
    }

    /**
     * Method to notify click events to the backend
     **/
    @PostMapping("/onClick")
    public ResponseEntity<GameState> handleMove(@RequestBody String polygonText) {
        try {
            System.out.println("Polygon: " + polygonText);
            if (game == null) {
                System.out.println("Game is null, creating new game");
                this.game = new GameMain();
            }
            GameState result = game.onClick(polygonText);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error in handleMove: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Method to fetch the current player information from backend
     **/
    @GetMapping("/currentPlayer")
    public String handlePlayerTurn(){
        System.out.println("Requesting current player");
        if (game == null) {
            this.game = new GameMain();
        }
        return game.getTurn().toString();
    }

    /**
     * Method to fetch the current board information from backend
     **/
    @GetMapping("/board")
    public Map<String, String> handleBoardRequest(){
        if (game == null) {
            this.game = new GameMain();
        }
        Map<String, String> board = game.getBoard();
        System.out.println("Board state: " + board);
        return board;
    }


}
