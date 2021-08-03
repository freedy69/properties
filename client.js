console.log("hi");

var WAIT = (ms) => new Promise(res => setTimeout(res, ms));
var Properties = null;
var PropertiesReceived = false;

CheckPos();

on("playerSpawned", () => {
    emitNet("Properties->RequestList");
});

on("onResourceStart", (res) => {
    if (res == GetCurrentResourceName())
    {
        emitNet("Properties->RequestList");
    }
});

onNet("Properties->ReceiveList", (properties) => {
    Properties = properties;
    PropertiesReceived = false;
    console.log(properties);

    for (property of properties)
    {
        AddTextEntry(property.txtEntry, property.name);
        AddTextEntry(property.garageTxtEntry, property.garageName);

        var blip = AddBlipForCoord(property.extCoords[0], property.extCoords[1], property.extCoords[2]);
        SetBlipSprite(blip, property.blipId);
        SetBlipAsShortRange(blip, true);
        SetBlipCategory(blip, 10);
        BeginTextCommandSetBlipName(property.txtEntry);
        EndTextCommandSetBlipName(blip);

        console.log(`creating blip for ${property.name}`);

        var garageBlip = AddBlipForCoord(property.garageCoords[0], property.garageCoords[1], property.garageCoords[2]);
        SetBlipSprite(garageBlip, property.garageBlipId);
        SetBlipAsShortRange(garageBlip, true);
        BeginTextCommandSetBlipName(property.garageTxtEntry);
        EndTextCommandSetBlipName(garageBlip);

        console.log(`creating blip for ${property.garageName}`);
    }
});

async function CheckPos()
{
    while (true)
    {
        if (PropertiesReceived)
        {
            var localPos = GetEntityCoords(PlayerPedId());
            for (property of Properties)
            {
                var d = GetDistance(localPos[0], localPos[1], localPos[2], property.extCoords[0], property.extCoords[1], property.extCoords[2]);

                if (d < 20)
                {
                    console.log(`player is closest to ${property.name} at ${property.extCoords}`);
                }
            }
        }

        await WAIT(5000);
    }
}

function GetDistance(x1, y1, z1, x2, y2, z2)
{
    var a = x2 - x1;
    var b = y2 - y1;
    var c = z2 - z1;

    var distance = Math.sqrt((a * a) + (b * b) + (c * c));

    return distance;
}
