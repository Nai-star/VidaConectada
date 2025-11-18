async function getCarusel() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/carusel", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching carusel');
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching carusel:', error);
        throw error;
    }
}
export default{getCarusel}
