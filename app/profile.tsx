import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Text, List, FAB, Button, Searchbar } from 'react-native-paper'; 
//@ts-ignore 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
};

type RootStackParamList = {
  profile: undefined;
  CreateContact: undefined;
};

type profileProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'profile'>;
};

const profile = ({ navigation }: profileProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhoneNumber, setNewContactPhoneNumber] = useState('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');  

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('@contacts');
      if (storedContacts !== null) {
        const parsedContacts = JSON.parse(storedContacts);
        const sortedContacts = parsedContacts.sort((a: Contact, b: Contact) =>
          a.name.localeCompare(b.name)
        );
        setContacts(sortedContacts);
        setFilteredContacts(sortedContacts); 
      }
    } catch (e) {
      console.log('Failed to load contacts', e);
    }
  };

  const saveContact = async () => {
    if (!newContactName || !newContactPhoneNumber) {
      Alert.alert('Error', 'Please fill in both the name and phone number.');
      return;
    }

    if (newContactPhoneNumber.length !== 10) {
      Alert.alert('Error', 'Please Enter a Valid Mobile Number.');
      return;
    }

    const updatedContacts = editingContactId
      ? contacts.map((contact) =>
          contact.id === editingContactId
            ? { ...contact, name: newContactName, phoneNumber: newContactPhoneNumber }
            : contact
        )
      : [...contacts, { id: Date.now().toString(), name: newContactName, phoneNumber: newContactPhoneNumber }];

    const sortedContacts = updatedContacts.sort((a, b) => a.name.localeCompare(b.name));

    setContacts(sortedContacts);
    setFilteredContacts(sortedContacts);  
    await AsyncStorage.setItem('@contacts', JSON.stringify(sortedContacts));

    resetModal();
  };

  const resetModal = () => {
    setIsModalVisible(false);
    setNewContactName('');
    setNewContactPhoneNumber('');
    setEditingContactId(null);
  };

  const handleCancel = () => {
    if (newContactName || newContactPhoneNumber) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: resetModal },
        ]
      );
    } else {
      resetModal();
    }
  };

  const handleEditContact = (contact: Contact) => {
    setNewContactName(contact.name);
    setNewContactPhoneNumber(contact.phoneNumber);
    setEditingContactId(contact.id);
    setIsModalVisible(true);
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedContacts = contacts.filter((contact) => contact.id !== id);
            setContacts(updatedContacts.sort((a, b) => a.name.localeCompare(b.name)));
            setFilteredContacts(updatedContacts);  
            await AsyncStorage.setItem('@contacts', JSON.stringify(updatedContacts));
          },
        },
      ]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query) {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);  
    }
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => handleEditContact(item)}
      onLongPress={() => handleDeleteContact(item.id)}
    >
      <List.Item
        title={item.name}
        description={item.phoneNumber}
        left={() => <List.Icon icon="account" />}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Contacts"
        value={searchQuery}
        onChangeText={handleSearch}  
        style={styles.searchBar}
      />

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}  
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
        />
      )}

      <FAB
        style={styles.fab}
        mode='flat'
        icon="plus"
        onPress={() => setIsModalVisible(true)}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContactId ? 'Edit Contact' : 'Add New Contact'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newContactName}
              onChangeText={setNewContactName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newContactPhoneNumber}
              onChangeText={setNewContactPhoneNumber}
            />

            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={saveContact}>
                {editingContactId ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingVertical: 5,
    backgroundColor: '#f4f4f4',
  },
  searchBar: {
    marginBottom: 0, 
    marginTop:10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  cancelButton: {
    marginLeft: 0,
  },
});

export default profile;