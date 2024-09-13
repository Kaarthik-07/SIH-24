import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ImageSourcePropType, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // You may need to install `expo/vector-icons`

type ChatItemProps = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  profileImage: ImageSourcePropType;
  messageType: 'text' | 'video';
};

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
};

const data: ChatItemProps[] = [
  { id: '1', name: 'Phillip Vetrovs', lastMessage: 'You: Hi, Phillip', time: '10:03', profileImage: require('../assets/p1.png'), messageType: 'text' },
  { id: '2', name: 'Carla Kenter', lastMessage: 'Video message', time: '12:21', profileImage: require('../assets/p2.png'), messageType: 'video' },
  { id: '3', name: 'Jaxson Saris', lastMessage: 'OK. Let me check', time: '10:19', profileImage: require('../assets/p3.png'), messageType: 'text' },
  { id: '4', name: 'Tiana Dokidis', lastMessage: 'Video message', time: '2 Jun', profileImage: require('../assets/p1.png'), messageType: 'video' },
];

const ChatItem: React.FC<ChatItemProps & { onPress: () => void }> = ({ name, lastMessage, time, profileImage, messageType, onPress }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center p-4 m-2 bg-white rounded-lg border-2 border-black shadow-md">
    <Image source={profileImage} className="w-12 h-12 rounded-full" />
    <View className="flex-1 ml-4">
      <Text className="text-lg font-semibold">{name}</Text>
      <Text className="text-gray-500">{lastMessage}</Text>
      <Text className="text-gray-400 text-sm">{time}</Text>
    </View>
    {messageType === 'video' && (
      <Text className="text-purple-600 ml-2">📹</Text>
    )}
  </TouchableOpacity>
);

const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ChatScreen: React.FC<{ chatData: ChatItemProps; onBack: () => void }> = ({ chatData, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: chatData.lastMessage, sender: 'user', time: chatData.time },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const currentTime = getCurrentTime();
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), text: newMessage, sender: 'me', time: currentTime }
      ]);
      setNewMessage('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f0f0f0]">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-blue-500 text-lg p-4">⬅ Back</Text>
      </TouchableOpacity>
      <View className="flex-row items-center p-4 bg-white shadow-md">
        <Image source={chatData.profileImage} className="w-12 h-12 rounded-full" />
        <Text className="ml-4 text-lg font-semibold">{chatData.name}</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {messages.map((message) => (
          <View
            key={message.id}
            className={`p-3 mb-2 ${message.sender === 'me' ? 'bg-[#6E42D3] self-end rounded-lg' : 'bg-white self-start border border-black rounded-lg'} max-w-[80%]`}
          >
            <Text className={`text-base ${message.sender === 'me' ? 'text-white' : 'text-black'}`}>{message.text}</Text>
            <Text className={`text-gray-400 text-sm ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>{message.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View className="flex-row items-center p-4 bg-white border-t">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          className="flex-1 border p-2 rounded-md mr-4"
        />
        <TouchableOpacity onPress={handleSendMessage} className="p-3 bg-[#6E42D3] rounded-full">
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ChatList: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatItemProps | null>(null);

  if (selectedChat) {
    return <ChatScreen chatData={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <>
      <Text className="text-center mt-2 text-2xl">Chat Box</Text>
      <SafeAreaView className="flex-1 bg-[#f0f0f0]">
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatItem {...item} onPress={() => setSelectedChat(item)} />}
        />
      </SafeAreaView>
    </>
  );
};

export default ChatList;
