import fileDownload from "js-file-download";

export default function exportData(mapData, tilemap, regions, continents) {
    if (!mapData) {
        // populated with defaults
    }

    mapData.tileIndices = tilemap.getTileIndices();
    mapData.regions = regions;
    mapData.continents = continents;

    fileDownload(JSON.stringify(mapData), `${mapData.name}.json`);
}
