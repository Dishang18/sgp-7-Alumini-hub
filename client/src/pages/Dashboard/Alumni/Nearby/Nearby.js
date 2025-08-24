import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import Supercluster from "supercluster";
import Geocoder from "./Geocoder";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const supercluster = new Supercluster({
  radius: 75,
  maxZoom: 20,
});

// Custom cluster icon
const createClusterIcon = (count) => {
  return L.divIcon({
    html: `<div class="cluster-marker">${count}</div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40),
  });
};

// Custom location pin icon
const locationIcon = L.icon({
  iconUrl: "/images/location-pin.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Map component that handles clustering
const MapWithClusters = ({ 
  clusters, 
  onMarkerClick, 
  popupInfo, 
  setPopupInfo,
  supercluster,
  mapRef,
  navigate
}) => {
  const map = useMap();

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  const handleProfileClick = (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupInfo(null); // Close popup first
    navigate(`/dashboard/profile/${profileId}`);
  };

  return (
    <>
      {clusters.map((cluster) => {
        const { cluster: isCluster, point_count } = cluster.properties;
        const [longitude, latitude] = cluster.geometry.coordinates;

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={createClusterIcon(point_count)}
              eventHandlers={{
                click: () => {
                  const zoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    20
                  );
                  map.setView([latitude, longitude], zoom, {
                    animate: true,
                    duration: 1.5,
                  });
                },
              }}
            />
          );
        }

        return (
          <Marker
            key={`batchmate-${cluster.properties.id}`}
            position={[latitude, longitude]}
            icon={locationIcon}
            eventHandlers={{
              click: () => onMarkerClick(cluster),
            }}
          >
            {popupInfo && popupInfo.properties.id === cluster.properties.id && (
              <Popup
                className="custom-popup"
                closeButton={true}
                onClose={() => setPopupInfo(null)}
              >
                <div className="bg-gray-900 p-4 rounded-lg text-white">
                  <img
                    src={cluster.properties?.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mb-2 object-cover"
                  />
                  <button
                    onClick={(e) => handleProfileClick(e, cluster.properties?.id)}
                    className="hover:underline text-left w-full bg-transparent border-none text-white cursor-pointer"
                  >
                    <p className="hover:underline">
                      <strong>{cluster.properties?.name}</strong>
                    </p>
                  </button>
                  <p>{cluster.properties?.major}</p>
                  <p>Graduation Year: {cluster.properties?.graduationYear}</p>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
};

const ConnectionsWithMap = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [batchmates, setBatchmates] = useState([]);
  const [filteredBatchmates, setFilteredBatchmates] = useState([]);
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef();

  const fetchBatchmates = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/alumni/get-all-alumni`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        }
      );
      if (response.data.success) {
        const data = response.data.data;

        const uniqueBranches = [
          ...new Set(data.map((item) => item.major).filter(Boolean)),
        ];
        const uniqueYears = [
          ...new Set(data.map((item) => item.graduationYear).filter(Boolean)),
        ];

        setBatchmates(data);
        setBranches(uniqueBranches);
        setYears(uniqueYears);
        setFilteredBatchmates(data);

        const pointsData = data.map((batchmate) => ({
          type: "Feature",
          properties: {
            cluster: false,
            id: batchmate._id,
            name: `${batchmate.firstName} ${batchmate.lastName}`,
            major: batchmate.major,
            graduationYear: batchmate.graduationYear,
            profilePicture: batchmate.profilePicture || "/images/defppic.jpg",
          },
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(batchmate.location.longitude),
              parseFloat(batchmate.location.latitude),
            ],
          },
        }));

        setPoints(pointsData);
      } else {
        toast.error("Failed to fetch alumni data.");
      }
    } catch (error) {
      toast.error("Something went wrong while fetching alumni data.");
    }
  };

  const applyFilters = () => {
    const filtered = batchmates.filter((batchmate) => {
      const matchesSearch = `${batchmate.firstName} ${batchmate.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesBranch =
        selectedBranch === "" || batchmate.major === selectedBranch;
      const matchesYear =
        selectedYear === "" ||
        batchmate.graduationYear === Number(selectedYear);
      return matchesSearch && matchesBranch && matchesYear;
    });

    setFilteredBatchmates(filtered);

    // Regenerate points for the map
    const filteredPoints = filtered.map((batchmate) => ({
      type: "Feature",
      properties: {
        cluster: false,
        id: batchmate._id,
        name: `${batchmate.firstName} ${batchmate.lastName}`,
        major: batchmate.major,
        graduationYear: batchmate.graduationYear,
        profilePicture: batchmate.profilePicture || "/images/defppic.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [
          parseFloat(batchmate.location.longitude),
          parseFloat(batchmate.location.latitude),
        ],
      },
    }));

    setPoints(filteredPoints);
  };

  const handleMarkerClick = (cluster) => {
    setPopupInfo(cluster);
  };

  useEffect(() => {
    fetchBatchmates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, selectedBranch, selectedYear]);

  useEffect(() => {
    if (points.length > 0) {
      supercluster.load(points);
      const bounds = L.latLngBounds(
        points.map((point) => [
          point.geometry.coordinates[1],
          point.geometry.coordinates[0],
        ])
      );
      setClusters(supercluster.getClusters(bounds.toBBoxString(), 10));
      
      // Update map center and zoom to fit all points
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [points]);

  return (
    <div className="bg-gray-900 max-h-screen px-8 py-0 text-white">
      <h1 className="text-3xl font-bold mb-6">Find Nearby Alumni</h1>
      <div className="bg-gray-800 p-4 rounded-lg mb-3">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white rounded-md outline-none focus:bg-gray-600"
          />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white rounded-md outline-none focus:bg-gray-600"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white rounded-md outline-none focus:bg-gray-600"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[60vh] rounded-lg relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Geocoder />
          <MapWithClusters
            clusters={clusters}
            onMarkerClick={handleMarkerClick}
            popupInfo={popupInfo}
            setPopupInfo={setPopupInfo}
            supercluster={supercluster}
            mapRef={mapRef}
            navigate={navigate}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default ConnectionsWithMap;
