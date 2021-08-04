console.log("hi");

var WAIT = (ms) => new Promise(res => setTimeout(res, ms));
var Properties = null;
var PropertiesReceived = false;
var DrawingMarkers = false;
var ClosestProperty = null;
var LastClosestProperty = null;
var NearbyDistance = 50;
var NotNearbyWaitTime = 2000;
var NearbyWaitTime = 0;
var InRange = false;
var CurrentCount = 0;
var MaxCount = 1;

CheckPos();

on("playerSpawned", () => {
    if (!PropertiesReceived)
    {
        emitNet("Properties->RequestList");
    }
});

on("onResourceStart", (res) => {
    if (res == GetCurrentResourceName())
    {
        emitNet("Properties->RequestList");
    }
});

onNet("Properties->ReceiveList", (properties) => {
    if (properties != null)
    {
        Properties = properties;
        PropertiesReceived = true;
    
        console.log(`Received ${Properties.length} properties.`);

        for (property of properties)
        {
            CreatePropertyBlips(property);
            console.log("Creating blips for property ", property.name, property.id);
        }
    }
});

async function CheckPos()
{
    while (true)
    {        
        if (PropertiesReceived)
        {
            ClosestProperty = GetClosestProperty();

            if (ClosestProperty)
            {
                LastClosestProperty = ClosestProperty;
                InRange = true;
                if (CurrentCount < MaxCount)
                {
                    PlayerEnteredPropertyRange(ClosestProperty);
                    CurrentCount++;
                }

                DrawMarker(0, ClosestProperty.extCoords[0], ClosestProperty.extCoords[1], ClosestProperty.extCoords[2], 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 105, 136, 184, 255, true, false, 2, false, null, null, false);

                if (ClosestProperty.garage.hasGarage)
                {
                    DrawMarker(0, ClosestProperty.garage.extCoords[0], ClosestProperty.garage.extCoords[1], ClosestProperty.garage.extCoords[2], 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 105, 136, 184, 255, true, false, 2, false, null, null, false);
                }
            }
            else
            {
                InRange = false;

                if (CurrentCount == MaxCount)
                {
                    PlayerLeftPropertyRange(LastClosestProperty);
                    CurrentCount = 0;
                    LastClosestProperty = null;
                }
            }
        }

        await WAIT(ClosestProperty ? NearbyWaitTime : NotNearbyWaitTime);
    }
}

function PlayerEnteredPropertyRange(property)
{
    AnnounceNearbyProperty(property.name, true);  
}

function PlayerLeftPropertyRange(property)
{
    AnnounceNearbyProperty(property.name,
}

function AnnounceNearbyProperty(name, entering)
{
    if (name && entering)
    {
        BeginTextCommandThefeedPost("STRING");
        AddTextComponentSubstringPlayerName(`You are near ${name}.`);
        EndTextCommandThefeedPostTicker(true, true);
    }
    else if (name && !entering)
    {
        BeginTextCommandThefeedPost("STRING");
        AddTextComponentSubstringPlayerName(`You left the area of ${name}.`);
        EndTextCommandThefeedPostTicker(true, true);
    }
}

function CreatePropertyBlips(property)
{
    AddTextEntry(property.txtEntry, property.name);
    var blip = AddBlipForCoord(property.extCoords[0], property.extCoords[1], property.extCoords[2]);
    SetBlipSprite(blip, property.blipId);
    SetBlipAsShortRange(blip, true);
    SetBlipCategory(blip, 10);
    BeginTextCommandSetBlipName(property.txtEntry);
    EndTextCommandSetBlipName(blip);    

    if (property.garage.hasGarage)
    {
        AddTextEntry(property.garage.txtEntry, property.garage.name);
        var garageBlip = AddBlipForCoord(property.garage.extCoords[0], property.garage.extCoords[1], property.garage.extCoords[2]);
        SetBlipSprite(garageBlip, property.garage.blipId);
        SetBlipAsShortRange(garageBlip, true);
        SetBlipCategory(garageBlip, 10);
        BeginTextCommandSetBlipName(property.garage.txtEntry);
        EndTextCommandSetBlipName(garageBlip);
    }
}

function GetClosestProperty()
{
    var localPos = GetEntityCoords(PlayerPedId());
    for (var i = 0; i < Properties.length; i++)
    {
        var distance = GetDistance(localPos[0], localPos[1], localPos[2], Properties[i].extCoords[0], Properties[i].extCoords[1], Properties[i].extCoords[2]);
        if (distance < NearbyDistance)
        {
            return Properties[i];
        }
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

function log(text)
{
    console.log(text);
}
