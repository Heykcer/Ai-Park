import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";

// Helper component to center map on user position
function MapRecenter({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 18, { animate: true });
        }
    }, [position, map]);
    return null;
}

export default function ParkMapContent({
    center,
    zones,
    customIcon,
    userIcon,
    userPosition,
    accuracy,
    setSelected,
    crowdConfig,
    L
}) {
    return (
        <MapContainer
            center={center}
            zoom={17}
            style={{ height: "100%", width: "100%" }}
            className="z-10"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {zones.map((zone) => (
                <Marker
                    key={zone.id}
                    position={[zone.lat, zone.lng]}
                    icon={customIcon(zone.emoji)}
                    eventHandlers={{
                        click: () => setSelected(zone),
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="font-fun text-center py-1">
                            <p className="font-black text-gray-800 text-lg uppercase leading-none">{zone.name}</p>
                            <p className="text-xs text-sky-blue font-bold tracking-widest">{zone.actual}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {userPosition && (
                <>
                    <Marker position={userPosition} icon={userIcon()}>
                        <Popup className="custom-popup">
                            <div className="font-fun text-center py-1 text-sky-blue font-black uppercase text-sm">
                                You are here
                            </div>
                        </Popup>
                    </Marker>
                    <Circle
                        center={userPosition}
                        radius={accuracy}
                        pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1, weight: 1 }}
                    />
                    <MapRecenter position={userPosition} />
                </>
            )}
        </MapContainer>
    );
}
