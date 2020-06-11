import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, SafeAreaView, Linking } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import { AxiosResponse } from 'axios';

import * as MailComposer from 'expo-mail-composer';
import api from '../../services/api';

interface IrouteParams {
  point_id: number;
}

interface IdetalheDoPonto {
  id: number;
  image: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  uf: string;
  itens: [
    {
      title: string
    }
  ]
}

const Detail: React.FC = () => {
  const [ponto, setPonto] = useState<IdetalheDoPonto>();


  const navigation = useNavigation();
  const { params } = useRoute();
  const { point_id } = params as IrouteParams;


  useEffect(() => {
    loadDetails()
  }, [point_id])

  async function loadDetails() {
    const response: AxiosResponse<IdetalheDoPonto> = await api.get(`points/${point_id}`);
    setPonto(response.data);
  }

  function handleNavigateBack() {
    navigation.goBack()
  }

  function goToWhatsapp(){
    Linking.openURL(`whatsapp://send?phone=${ponto!.whatsapp}&text=Olá tenho interesse em saber mais sobre a coleta de resíduos!`)
  }

  async function goToEmail(){
    await MailComposer.composeAsync({
      subject: 'Enteresse na coleta de resíduos',
      recipients: [ponto!.email],
    })
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity style={{marginTop: 35}} onPress={handleNavigateBack}>
          <Feather name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Image style={styles.pointImage} source={{uri: ponto?.image}} />
        <Text style={styles.pointName}>{ponto?.name}</Text>
        {ponto?.itens.map(item => <Text key={item.title} style={styles.pointItems}> {item.title} </Text>)}
        <View style={styles.address}>
          <Text style={styles.addressTitle}> Enderço </Text>
          <Text style={styles.addressContent}> {ponto?.city} </Text>
          <Text style={styles.addressContent}> {ponto?.uf} </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={goToWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}> Whatsapp </Text>
        </RectButton>
        <RectButton style={styles.button} onPress={goToEmail}>
          <Feather name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}> E=mail </Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
}

export default Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});