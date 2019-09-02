import React from 'react'
import { Platform, StyleSheet, Text, View, Dimensions, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import MapView, {Marker} from 'react-native-maps'
import  axios from 'axios'

const {width, height} = Dimensions.get('window')

export default class App extends React.Component{
  constructor(props) {
    super(props);
  
    this.state = {
      location:null,
      errorMessage: null,
      marker: null,
      data:null
    };
  }

  componentWillMount(){
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this.getLocationAsync();
    }
  }

  getLocationAsync = async() => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }
    let location = await Location.getCurrentPositionAsync({});
     let marker = [
        {
          latlng:{
                    latitude: -36.8125241,
                    longitude: -73.0733725
                  },
          title: 'Aqui estas tu!!!',
          subtitle: '',
          pinColor: '#00ff00' 
        }
      ]   
    
    await axios.get('https://farmanet.minsal.cl/maps/index.php/ws/getLocalesTurnos').then( response => {
        return response.data
      }).then( async data => {   
        await data.map(ele => { 
          let m = {
            latlng:{ 
              latitude:parseFloat(ele.local_lat),
              longitude: parseFloat(ele.local_lng)
            },
            title: ele.local_nombre,
            subtitle: ele.local_telefono 
          }
          ele.local_lat && ele.local_lng ?
          marker.push(m):
          null
        })
        await this.setState({ location, marker });
    }) .catch(error => Alert.alert('error'+error))  
  }   

  handlePress = ({title, description}) => {
    console.log(title, description)
  } 

  render(){
    return (
      <View style={styles.container}>
      {
        this.state.location?
          <MapView
            initialRegion={{
              latitude: this.state.location.coords.latitude,
              longitude: this.state.location.coords.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
              
            }}
            style={{width, height}}
          >
            {
              this.state.marker.map((ele,i) => <Marker key={ele.latlng+i} coordinate={ele.latlng} title={ele.title} description={ele.description} pinColor={ele.pinColor} opacity={0.5} onPress={e => console.log(e)}/>)
            }
            
          </MapView>
          :
          <ActivityIndicator size='large' />  
      }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
