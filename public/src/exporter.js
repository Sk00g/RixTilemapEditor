import fileDownload from "js-file-download";

export default function exportData(mapData, tilemap, regions) {
    if (!mapData) {
        // populated with defaults
    }

    mapData.tileIndices = tilemap.getTileIndices();
    mapData.regions = regions;

    fileDownload(JSON.stringify(mapData), `${mapData.name}.json`);
}
