import "./App.css";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

const words = [
  "東京", "りんご", "宇宙", "学校", "猫",
  "海", "電車", "王様", "雪", "本",
  "時計", "山", "花火", "先生", "魚",
  "空港", "忍者", "パン", "月", "ロボット",
  "病院", "映画", "橋", "カメラ", "森",
  "ピアノ", "カレー", "船", "犬", "砂漠",
  "電話", "宝石", "火山", "野球", "城",
];

const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const createCards = () => {
  const selectedWords = shuffle(words).slice(0, 25);

  const types = shuffle([
    ...Array(9).fill("red"),
    ...Array(8).fill("blue"),
    ...Array(7).fill("civilian"),
    "assassin",
  ]);

  return selectedWords.map((word, index) => ({
    word,
    type: types[index],
    revealed: false,
  }));
};

function App() {
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);
  const [spymasterMode, setSpymasterMode] = useState(false);

  const createRoom = async () => {
    const roomRef = await addDoc(collection(db, "rooms"), {
      cards: createCards(),
      turn: "red",
      winner: null,
      createdAt: serverTimestamp(),
    });

    setRoomId(roomRef.id);
  };

  const revealCard = async (index) => {
    if (!room || room.winner) return;

    const newCards = [...room.cards];

    if (newCards[index].revealed) return;

    newCards[index] = {
      ...newCards[index],
      revealed: true,
    };

    let winner = null;

    if (newCards[index].type === "assassin") {
      winner = room.turn === "red" ? "blue" : "red";
    } else {
      const redLeft = newCards.filter(
        (card) => card.type === "red" && !card.revealed
      ).length;

      const blueLeft = newCards.filter(
        (card) => card.type === "blue" && !card.revealed
      ).length;

      if (redLeft === 0) winner = "red";
      if (blueLeft === 0) winner = "blue";
    }

    await updateDoc(doc(db, "rooms", roomId), {
      cards: newCards,
      winner,
    });
  };

  const switchTurn = async () => {
    if (!room) return;

    await updateDoc(doc(db, "rooms", roomId), {
      turn: room.turn === "red" ? "blue" : "red",
    });
  };

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
      if (snapshot.exists()) {
        setRoom(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="app">
      <h1 className="title">🕵️ コードネーム風ゲーム</h1>

      <div className="panel">
        <button className="primary-button" onClick={createRoom}>
          ルーム作成
        </button>

        <div>
          <input
            className="room-input"
            placeholder="ルームIDを入力"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <p>
          <strong>現在のルームID:</strong> {roomId}
        </p>

        {room && (
          <>
            <p>
              <strong>現在のターン:</strong>{" "}
              {room.turn === "red" ? "🔴 赤チーム" : "🔵 青チーム"}
            </p>

            <button className="turn-button" onClick={switchTurn}>
              ターン交代
            </button>

            <label style={{ marginLeft: 16 }}>
              <input
                type="checkbox"
                checked={spymasterMode}
                onChange={(e) => setSpymasterMode(e.target.checked)}
              />
              スパイマスター表示
            </label>

            {room.winner && (
              <h2 className="winner">
                🎉 {room.winner === "red" ? "赤チーム" : "青チーム"}の勝利！
              </h2>
            )}
          </>
        )}
      </div>

      <div className="board">
        {room?.cards?.map((card, index) => (
          <button
            key={index}
            onClick={() => revealCard(index)}
            className={`card ${
              card.revealed || spymasterMode ? card.type : ""
            }`}
          >
            {card.word}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;