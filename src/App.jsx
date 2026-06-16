import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

const words = ["東京", "りんご", "宇宙", "学校", "猫", "海", "電車", "王様", "雪", "本"];

function App() {
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);

  const createRoom = async () => {
    const cards = words.slice(0, 9).map((word) => ({
      word,
      revealed: false,
    }));

    const roomRef = await addDoc(collection(db, "rooms"), {
      cards,
      createdAt: serverTimestamp(),
    });

    setRoomId(roomRef.id);
  };

  const revealCard = async (index) => {
    if (!room) return;

    const newCards = [...room.cards];
    newCards[index].revealed = true;

    await updateDoc(doc(db, "rooms", roomId), {
      cards: newCards,
    });
  };

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
      setRoom(snapshot.data());
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div style={{ padding: 24 }}>
      <h1>コードネーム風ゲーム</h1>

      <button onClick={createRoom}>ルーム作成</button>

      <div style={{ marginTop: 16 }}>
        <input
          placeholder="ルームID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>

      <p>現在のルームID: {roomId}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: 8 }}>
        {room?.cards?.map((card, index) => (
          <button
            key={index}
            onClick={() => revealCard(index)}
            style={{ height: 80 }}
          >
            {card.revealed ? card.word : "？"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;