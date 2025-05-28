<template>
    <div class="school-branches">
        <h2>
            <span class="icon">🏫</span>
            Filippers International School Branches
        </h2>

        <div class="branches-grid">
            <div v-for="branch in branches" :key="branch.id" class="branch-card" :class="{ active: selectedBranch?.id === branch.id }" @click="selectBranch(branch)" tabindex="0" @keyup.enter="selectBranch(branch)">
                <div class="branch-header">
                    <span class="branch-icon">📍</span>
                    <h3>{{ branch.branch_name }}</h3>
                </div>
                <p class="branch-address">{{ branch.address }}</p>
            </div>
        </div>

        <div class="map-section" v-if="selectedBranch">
            <div class="map-container" v-html="selectedBranch.location"></div>
        </div>
    </div>
</template>

<script>
import axiosInstance from '@/util/axios-config';
import { onMounted, ref } from 'vue';

export default {
    name: 'SchoolBranch',
    setup() {
        const branches = ref([]);
        const selectedBranch = ref(null);

        const fetchBranches = async () => {
            try {
                const res = await axiosInstance.get('/branches'); // Update base URL if needed
                branches.value = res.data;
                selectedBranch.value = branches.value[0];
            } catch (error) {
                console.error('Failed to fetch branches:', error);
            }
        };

        const selectBranch = (branch) => {
            selectedBranch.value = branch;
        };

        onMounted(fetchBranches);

        return {
            branches,
            selectedBranch,
            selectBranch
        };
    }
};
</script>

<style scoped>
.school-branches {
    padding: 2rem 1rem;
    max-width: 1200px;
    margin: auto;
    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(80, 120, 200, 0.08);
}
h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    font-weight: 700;
    color: #2a3b6b;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
}
.icon {
    font-size: 2rem;
}
.branches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}
.branch-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem 1rem;
    cursor: pointer;
    transition:
        box-shadow 0.2s,
        transform 0.2s,
        border 0.2s;
    border: 2px solid transparent;
    box-shadow: 0 2px 8px rgba(80, 120, 200, 0.07);
    outline: none;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.branch-card:hover,
.branch-card:focus {
    box-shadow: 0 6px 24px rgba(80, 120, 200, 0.18);
    border: 2px solid #4f8cff;
    transform: translateY(-4px) scale(1.03);
}
.branch-card.active {
    border: 2px solid #2a3b6b;
    background: linear-gradient(135deg, #e0e7ff 60%, #f0f4ff 100%);
    box-shadow: 0 8px 32px rgba(80, 120, 200, 0.18);
}
.branch-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
}
.branch-icon {
    font-size: 1.3em;
    color: #4f8cff;
}
.branch-address {
    color: #4f4f4f;
    margin-top: 0.5em;
    font-size: 1em;
    word-break: break-word;
}
.map-section {
    width: 100%;
    min-height: 400px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(80, 120, 200, 0.1);
    background: #e0e7ff;
    margin-top: 2rem;
    position: relative;
    display: block;
}

.map-container {
    width: 100%;
    height: 100%;
    position: relative;
}

/* Force any embedded content to be full width */
.map-container * {
    max-width: 100% !important;
    width: 100% !important;
}

/* Add override for Google Maps iframes specifically */
.map-container iframe[src*='google.com/maps'] {
    width: 100% !important;
    height: 400px !important;
    display: block !important;
}

/* Make sure no padding or margins on container elements */
.map-section,
.map-container {
    padding: 0 !important;
    margin: 0 !important;
    display: block;
    width: 100%;
}

.map-container iframe {
    width: 100% !important;
    height: 400px !important;
    border: none;
    position: relative;
    display: block;
    max-width: 100%;
}
@media (max-width: 900px) {
    .school-branches {
        padding: 1.2rem 0.5rem;
    }
    h2 {
        font-size: 1.4rem;
    }
    .branches-grid {
        gap: 1rem;
    }
    .branch-card {
        padding: 1rem 0.7rem;
        min-height: 100px;
    }
}
@media (max-width: 600px) {
    .school-branches {
        padding: 0.5rem 0.2rem;
    }
    .branches-grid {
        grid-template-columns: 1fr;
        gap: 0.7rem;
    }
    .map-section {
        min-height: 250px;
    }
}
</style>
