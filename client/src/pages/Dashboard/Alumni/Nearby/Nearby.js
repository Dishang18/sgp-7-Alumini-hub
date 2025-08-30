// src/components/ConnectionsWithMap.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import Supercluster from "supercluster";
import Geocoder from "./Geocoder";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// ✅ Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ✅ Cluster instance
const supercluster = new Supercluster({
  radius: 75,
  maxZoom: 20,
});

// ✅ Cluster circle with number
const createClusterIcon = (count) =>
  L.divIcon({
    html: `<div class="cluster-marker">${count}</div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40),
  });

// ✅ Alumni marker with name label
const createAlumniIcon = (name) =>
  L.divIcon({
    html: `<div class="alumni-marker">${name}</div>`,
    className: "custom-alumni-icon",
    iconSize: [120, 30],
    iconAnchor: [60, 15],
    popupAnchor: [0, -15],
  });

// ---------------- Map Renderer ----------------
const MapWithClusters = ({
  clusters,
  onMarkerClick,
  popupInfo,
  supercluster,
  mapRef,
}) => {
  const map = useMap();

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

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
                    duration: 1,
                  });
                },
              }}
            />
          );
        }

        // ✅ Show alumni marker with their names
        return (
          <Marker
            key={`alumni-${cluster.properties.id}`}
            position={[latitude, longitude]}
            icon={createAlumniIcon(cluster.properties.name)}
            eventHandlers={{
              click: () => onMarkerClick(cluster),
            }}
          >
            {popupInfo &&
              popupInfo.properties.id === cluster.properties.id && (
                <Popup>
                  <div>
                    <p>
                      <strong>{cluster.properties?.name}</strong>
                    </p>
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

// ✅ Hook to update clusters when map moves
const UpdateClusters = ({ points, setClusters }) => {
  const map = useMapEvents({
    moveend: () => {
      if (points.length > 0) {
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];
        const zoom = map.getZoom();
        const clusterData = supercluster.getClusters(bbox, zoom);
        setClusters(clusterData);
      }
    },
  });

  useEffect(() => {
    if (points.length > 0) {
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      const zoom = map.getZoom();
      const clusterData = supercluster.getClusters(bbox, zoom);
      setClusters(clusterData);
    }
  }, [points, map, setClusters]);

  return null;
};

// ---------------- Main Component ----------------
const ConnectionsWithMap = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [batchmates, setBatchmates] = useState([]);
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef();

  // Fetch Alumni
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
        const data = response.data.data || [];
        const uniqueBranches = [
          ...new Set(data.map((item) => item.major).filter(Boolean)),
        ];
        const uniqueYears = [
          ...new Set(data.map((item) => item.graduationYear).filter(Boolean)),
        ];

        setBatchmates(data);
        setBranches(uniqueBranches);
        setYears(uniqueYears);

        const pointsData = data
          .filter((b) => b.location?.latitude && b.location?.longitude)
          .map((batchmate) => ({
            type: "Feature",
            properties: {
              cluster: false,
              id: batchmate._id,
              name: `${batchmate.firstName} ${batchmate.lastName}`,
              major: batchmate.major,
              graduationYear: batchmate.graduationYear,
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
        supercluster.load(pointsData);
      } else {
        toast.error("Failed to fetch alumni data.");
      }
    } catch (error) {
      toast.error("Error fetching alumni data.");
    }
  };

  // Apply Filters
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

    const filteredPoints = filtered
      .filter((b) => b.location?.latitude && b.location?.longitude)
      .map((batchmate) => ({
        type: "Feature",
        properties: {
          cluster: false,
          id: batchmate._id,
          name: `${batchmate.firstName} ${batchmate.lastName}`,
          major: batchmate.major,
          graduationYear: batchmate.graduationYear,
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
    supercluster.load(filteredPoints);
  };

  const handleMarkerClick = (cluster) => {
    setPopupInfo(cluster);
  };

  // Effects
  useEffect(() => {
    fetchBatchmates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, selectedBranch, selectedYear]);

  return (
    <div className="bg-gray-900 max-h-screen px-8 py-0 text-white">
      <h1 className="text-3xl font-bold mb-6">Find Nearby Alumni</h1>

      {/* Filters */}
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

      {/* Map */}
      <div className="h-[60vh] rounded-lg relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Geocoder />
          <UpdateClusters points={points} setClusters={setClusters} />
          <MapWithClusters
            clusters={clusters}
            onMarkerClick={handleMarkerClick}
            popupInfo={popupInfo}
            supercluster={supercluster}
            mapRef={mapRef}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default ConnectionsWithMap;
