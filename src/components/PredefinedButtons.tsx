import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Save } from "lucide-react";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/components/ui/use-toast";

interface ButtonSet {
  id?: string;
  name: string;
  buttons: {
    text: string;
    url: string;
    row: number;
  }[];
}

interface PredefinedButtonsProps {
  onSelectButtons: (buttons: ButtonSet['buttons']) => void;
  currentButtons: ButtonSet['buttons'];
}

export const PredefinedButtons = ({ onSelectButtons, currentButtons }: PredefinedButtonsProps) => {
  const [buttonSets, setButtonSets] = useState<ButtonSet[]>([]);
  const [newSetName, setNewSetName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadButtonSets();
  }, []);

  const loadButtonSets = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'buttonSets'));
      const sets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ButtonSet[];
      setButtonSets(sets);
    } catch (error) {
      console.error('Error loading button sets:', error);
      toast({
        title: "Error",
        description: "Failed to load button sets",
        variant: "destructive",
      });
    }
  };

  const saveCurrentButtons = async () => {
    if (!newSetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the button set",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'buttonSets'), {
        name: newSetName,
        buttons: currentButtons
      });
      setNewSetName('');
      loadButtonSets();
      toast({
        title: "Success",
        description: "Button set saved successfully",
      });
    } catch (error) {
      console.error('Error saving button set:', error);
      toast({
        title: "Error",
        description: "Failed to save button set",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Predefined Button Sets</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter set name"
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
        />
        <Button onClick={saveCurrentButtons} className="whitespace-nowrap">
          <Save className="w-4 h-4 mr-2" />
          Save Current
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {buttonSets.map((set) => (
          <Button
            key={set.id}
            variant="outline"
            onClick={() => onSelectButtons(set.buttons)}
            className="justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            {set.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};