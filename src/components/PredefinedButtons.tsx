import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2, Edit2 } from "lucide-react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
  currentButtons: {
    text: string;
    url: string;
    row: number;
  }[];
}

export const PredefinedButtons = ({ onSelectButtons, currentButtons }: PredefinedButtonsProps) => {
  const [buttonSets, setButtonSets] = useState<ButtonSet[]>([]);
  const [newSetName, setNewSetName] = useState('');
  const [editingSet, setEditingSet] = useState<string | null>(null);
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
      if (editingSet) {
        await updateDoc(doc(db, 'buttonSets', editingSet), {
          name: newSetName,
          buttons: currentButtons.map(button => ({
            ...button,
            row: button.row || 0
          }))
        });
        setEditingSet(null);
      } else {
        await addDoc(collection(db, 'buttonSets'), {
          name: newSetName,
          buttons: currentButtons.map(button => ({
            ...button,
            row: button.row || 0
          }))
        });
      }
      setNewSetName('');
      await loadButtonSets();
      toast({
        title: "Success",
        description: editingSet ? "Button set updated successfully" : "Button set saved successfully",
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

  const deleteButtonSet = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'buttonSets', id));
      await loadButtonSets();
      toast({
        title: "Success",
        description: "Button set deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting button set:', error);
      toast({
        title: "Error",
        description: "Failed to delete button set",
        variant: "destructive",
      });
    }
  };

  const editButtonSet = (set: ButtonSet) => {
    setNewSetName(set.name);
    setEditingSet(set.id);
    onSelectButtons(set.buttons);
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
          {editingSet ? 'Update' : 'Save Current'}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {buttonSets.map((set) => (
          <div key={set.id} className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onSelectButtons(set.buttons)}
              className="justify-start flex-grow"
            >
              <Plus className="w-4 h-4 mr-2" />
              {set.name}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => editButtonSet(set)}
              className="px-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => set.id && deleteButtonSet(set.id)}
              className="px-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};