import { View, Text, StyleSheet} from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from './Colors'

const Footer = () => {
  return (
    <View style={styles.footer}>
          <Icon color={colors.black} size={25} name="home" />
          <Icon color={colors.gray} size={25} name="search" />
          <Icon color={colors.gray} size={25} name="plus-square" />
          <Icon color={colors.gray} size={25} name="heart" />
          <Icon color={colors.gray} size={25} name="user" />

        </View>
  )
}
export const styles = StyleSheet.create({
    footer: {
        display: 'flex',
        flexDirection: 'row',
        position: 'fixed', // Fixed position
        bottom: 0,
        justifyContent: 'space-between',
        padding: 10,
        borderTopColor: colors.gray1,
        borderTopWidth: 1,
        width: '100%', // Occupy full width
        backgroundColor: 'white',
      },
});

export default Footer;