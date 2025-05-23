import { useState, useCallback, useRef } from 'react'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'

const libraries = ['places']

// Fixed drop-off address and city centers with coordinates
const DROP_OFF_ADDRESS = '11 Grand Ave, Camellia NSW 2142'

const CITY_CENTERS = {
  Sydney: { lat: -33.8688, lng: 151.2093, price: 179.95 },
  Melbourne: { lat: -37.8136, lng: 144.9631, price: 209.95 },
  Canberra: { lat: -35.2809, lng: 149.13, price: 199.95 },
  Brisbane: { lat: -27.4698, lng: 153.0251, price: 219.95 },
}

export default function BookingForm() {
  const [pickup, setPickup] = useState('')
  const [sku, setSku] = useState('')
  const [serial, setSerial] = useState('')
  const [ticket, setTicket] = useState('')
  const [price, setPrice] = useState(null)
  const [status, setStatus] = useState('')

  const autocompleteRef = useRef(null)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_GOOGLE_API_KEY', // replace this with env var ideally
    libraries,
  })

  const onLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setPickup(place.formatted_address)
      } else if (place.name) {
        setPickup(place.name)
      }
    }
  }

  const getDistanceInKm = (origin, destination) => {
    return new Promise((resolve, reject) => {
      const service = new window.google.maps.DistanceMatrixService()
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status !== 'OK') {
            reject(status)
          } else {
            try {
              const element = response.rows[0].elements[0]
              if (element.status === 'OK') {
                // distance in meters -> convert to km
                const distanceInKm = element.distance.value / 1000
                resolve(distanceInKm)
              } else {
                reject(element.status)
              }
            } catch (err) {
              reject(err)
            }
          }
        }
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setPrice(null)

    if (!pickup) {
      setStatus('Please enter a pickup location')
      return
    }

    if (!sku || !serial || !ticket) {
      setStatus('Please fill all fields')
      return
    }

    try {
      // Get distance between pickup and drop-off
      const distance = await getDistanceInKm(pickup, DROP_OFF_ADDRESS)

      // Find which metro zone this pickup belongs to (within 50 km of city center)
      const cityEntry = Object.entries(CITY_CENTERS).find(([city, data]) => {
        // Calculate distance from pickup to city center:
        // Using Distance Matrix API again for this (or simple approx)
        // For simplicity here, just do a rough check with Distance Matrix again:

        // We need to await this distance check, so better to do sequentially.
        // But Promise.all isn't trivial here in sync .find, so let's change approach:

        return false // placeholder to satisfy .find, we'll do this better below
      })

      // We do it better with a loop:
      let matchedCity = null
      for (const [city, data] of Object.entries(CITY_CENTERS)) {
        // get distance from pickup to city center
        // this requires another DistanceMatrixService call, so let's make helper:

        const distToCityCenter = await getDistanceInKm(pickup, { lat: data.lat, lng: data.lng })

        if (distToCityCenter <= 50) {
          matchedCity = { city, ...data }
          break
        }
      }

      if (!matchedCity) {
        setStatus('Pickup location outside supported metro zones. Please contact us.')
        return
      }

      // Finally, save booking with matched price
      const finalPrice = matchedCity.price

      // Supabase saving omitted here - add your supabase call here to save booking

      setPrice(finalPrice)
      setStatus(`Booking submitted! Price: $${finalPrice.toFixed(2)} per panel`)
    } catch (err) {
      console.error(err)
      setStatus('Error calculating distance or submitting booking. Please try again.')
    }
  }

  if (!isLoaded) return <div>Loading map...</div>

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Book Panel Shipping</h2>

      <div className="mb-4">
        <label htmlFor="pickup" className="block text-gray-700 mb-1">
          Pickup location
        </label>
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            id="pickup"
            type="text"
            placeholder="Start typing pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </Autocomplete>
      </div>

      <input
        type="text"
        placeholder="Panel SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />
      <input
        type="text"
        placeholder="Panel Serial Number"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />
      <input
        type="text"
        placeholder="Ticket Number"
        value={ticket}
        onChange={(e) => setTicket(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />

      <div className="text-sm text-gray-500 mb-4">
        Drop-off is fixed: 11 Grand Ave, Camellia NSW 2142
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 w-full"
      >
        Submit Booking
      </button>

      {status && <p className="mt-4 text-sm text-red-600">{status}</p>}
      {price && <p className="mt-2 font-bold text-blue-700">Price: ${price.toFixed(2)} per panel</p>}
    </form>
  )
}
