import { useWallet } from "@mysten/wallet-kit";
import { useState } from "react";

interface Member {
  address: string;
  percentage: number;
}

export default function CreateSplitPage() {
  const { connected, account } = useWallet();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addMember = () => {
    if (members.length >= 10) {
      setError("Maximum 10 members allowed");
      return;
    }
    setMembers([...members, { address: "", percentage: 0 }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof Member, value: string | number) => {
    const newMembers = [...members];
    newMembers[index] = {
      ...newMembers[index],
      [field]: value,
    };
    setMembers(newMembers);
  };

  const validatePercentages = (): boolean => {
    const total = members.reduce((sum, member) => sum + member.percentage, 0);
    return total === 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePercentages()) {
      setError("Percentages must sum to 100%");
      return;
    }
    // TODO: Call smart contract
  };

  if (!connected) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Create New Split</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {members.map((member, index) => (
          <div key={index} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Wallet Address"
              value={member.address}
              onChange={(e) => updateMember(index, "address", e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Percentage"
              value={member.percentage}
              min="0"
              max="100"
              onChange={(e) => updateMember(index, "percentage", Number(e.target.value))}
              className="w-24 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeMember(index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addMember}
          className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Add Member
        </button>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
        >
          Create Split
        </button>
      </form>
    </div>
  );
}