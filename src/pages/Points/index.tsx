import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import MapView, { Marker } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';
import * as expoLocation from 'expo-location'

import api from '../../services/api';
import { AxiosResponse } from 'axios';

interface ItensDTO {
  id: number;
  title: string;
  image_url: string;
}

interface PointDTO {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;

}

interface IdadosDTO {
  city: string;
  uf: string;
}

const Points: React.FC = () => {

  const [itens, setItens] = useState<ItensDTO[]>([]);
  const [selectedItens, setSelectedItens] = useState<number[]>([]);
  const [location, setLocation] = useState<[number, number]>([0,0]);
  const [points, setPoint] = useState<PointDTO[]>([]);

  const route = useRoute();
  const navigation = useNavigation();

  const { city: cityPraRequest, uf: ufPraRequest } = route.params as IdadosDTO;
  console.log(cityPraRequest, ufPraRequest)

  useEffect(() => {
    loadCordenates();
    loadItens()
  }, []);

  useEffect(() => {
    loadPoints();
  }, [cityPraRequest, ufPraRequest, selectedItens])

  async function loadCordenates() {
    const { status } = await expoLocation.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('OPS!', 'Precisamos de sua permição para obter a localização')
      return;
    }

    const coordenada = await expoLocation.getCurrentPositionAsync({
      enableHighAccuracy: true
    });
    
    const { latitude, longitude } = coordenada.coords;


    setLocation([latitude, longitude])
  }

  async function loadItens() {
    const response: AxiosResponse<ItensDTO[]> = await api.get('/itens');

    setItens(response.data);
  }

  async function loadPoints() {
    const resposne: AxiosResponse<PointDTO[]> = await api.get('/points',{
      params: {
        city: String(cityPraRequest),
        uf: String(ufPraRequest),
        itens: selectedItens
      }
    });

    setPoint(resposne.data);
  }


  function handleNavigateBack() {
    navigation.goBack()
  }

  function handleNavigateToDetails(id: number) {
    navigation.navigate('Details', {point_id: id})
  }

  function handleSelectItem(data: number) {
    const jaSelecionado = selectedItens!.findIndex(item => item === data);

    if (jaSelecionado >= 0) {
      const filteredItens = selectedItens!.filter(item => item !== data);

      setSelectedItens(filteredItens);
    } else {
      setSelectedItens([...(selectedItens as unknown) as number[], data]);
    }

  }


  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={{marginTop: 25}} onPress={handleNavigateBack}>
          <Feather name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem Vindo!</Text>
        <Text style={styles.description}> Econtre no mapa um ponto de coleta. </Text>

        <View style={styles.mapContainer}>
        {/* https://www.google.com/maps/@,,15z */}
        { location[0] !== 0 && (
          <MapView style={styles.map} initialRegion={{
            latitude: location[0],
            longitude: location[1],
            latitudeDelta: 0.016,
            longitudeDelta: 0.016
          }}
          loadingEnabled={location[0] === 0}
          >
            {points.map(ponto => (
              <Marker 
                coordinate={{
                  latitude: Number(ponto.latitude),
                  longitude: Number(ponto.longitude),
                }}
                key={ponto.id.toString()}
                onPress={() => handleNavigateToDetails(ponto.id)}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image 
                    style={styles.mapMarkerImage}
                    source={{uri: ponto.image}}/>
                    <Text style={styles.mapMarkerTitle}>{ponto.name}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) }
        </View>
      </View>
        <View style={styles.itemsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {itens.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.item, 
                  selectedItens?.includes(item.id) ? styles.selectedItem: {}
                ]} 
                activeOpacity={0.6} 
                onPress={() => handleSelectItem(item.id)}
                >
                  <SvgUri width={42} height={42} uri={item.image_url} />
                  <Text style={styles.itemTitle}> {item.title} </Text>
              </TouchableOpacity>
            ))}

        </ScrollView>
        </View>
    </>
  );
}

export default Points;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});