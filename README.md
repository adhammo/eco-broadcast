# Eco-Broadcast

**Eco-Broadcast** is the start point for [Cairo University Eco Racing Team](https://www.facebook.com/ShellEcoMarathonCUT) telemetry system (so-called _Eco-Telemetry_).

## Role in Eco-Telemetry

Collects sensors data and sends it over MQTT to [Eco-Monitor](https://github.com/adhammo/eco-monitor) which saves it in ([Cloud Firestore](https://firebase.google.com/docs/firestore)) to be displayed in real-time using [Eco-Monitor](https://github.com/adhammo/eco-display).

# Eco-Telemetry

A system to collect and send sensors data over the internet to be displayed and monitored in real-time.

## Eco-Telemetry description

An arduino collects and sends sensors data through serial to [Eco-Broadcast](https://github.com/adhammo/eco-broadcast) which in turn sends it through an MQTT Broker ([Maqiatto.com](https://www.maqiatto.com/)) to [Eco-Monitor](https://github.com/adhammo/eco-monitor) which saves it to a real-time database ([Cloud Firestore](https://firebase.google.com/docs/firestore)) which updates, on change, [Eco-Display](https://github.com/adhammo/eco-display) where the data can be seen in real-time.
