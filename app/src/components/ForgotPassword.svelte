<script lang="ts">
    import axios from "axios";
    import { API_BASE_URL } from "../utils/constants";
    import { openedForgotPasswordWrite } from "../utils/stores";

    let opened = false;
    let formProcessing = false;
    let error = '';
    let validForm = false;
    let email = '';
    let code = '';
    let step = 1;

    openedForgotPasswordWrite.subscribe((value) => {
        opened = value;
    });

    function validateForm() {
        switch (step) {
            case 1:
                if ((document.getElementById('remail') as HTMLInputElement).value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
                    validForm = true;
                else
                    validForm = false;
                break;
            case 3:
                if (
                    (document.getElementById('rpassword') as HTMLInputElement).value.length >= 8 &&
                    (document.getElementById('rpassword') as HTMLInputElement).value.length <= 32 &&
                    (document.getElementById('rpassword') as HTMLInputElement).value === (document.getElementById('rpasswordConfirmation') as HTMLInputElement).value)
                    validForm = true;
                else
                    validForm = false;
        }
    }

    async function process() {
        formProcessing = true;

        switch (step) {
            case 1:
                await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                    action: 'send',
                    email: (document.getElementById('remail') as HTMLInputElement).value,
                    code: '',
                    password: ''
                }).then((response) => {
                    if (response.status === 200) {
                        email = (document.getElementById('remail') as HTMLInputElement).value;
                        step = 2;
                        error = '';
                        validForm = false;
                        formProcessing = false;
                    } else {
                        formProcessing = false;
                        if (response.data.error)
                            error = response.data.error;
                        else
                            error = "Nous n'avons pas pu envoyer l'email pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                    }
                }).catch((response) => {
                    formProcessing = false;
                    if (response.response.data.error)
                        error = response.response.data.error;
                    else
                        error = "Nous n'avons pas pu envoyer l'email pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                });
                break;
            case 2:
                await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                    action: 'code',
                    email: email,
                    code: [...document.querySelectorAll('.code-n')].map((e) => (e as HTMLInputElement).value).join(''),
                    password: ''
                }).then((response) => {
                    if (response.status === 200) {
                        code = [...document.querySelectorAll('.code-n')].map((e) => (e as HTMLInputElement).value).join('');
                        step = 3;
                        error = '';
                        validForm = false;
                        formProcessing = false;
                    } else {
                        formProcessing = false;
                        if (response.data.error)
                            error = response.data.error;
                        else
                            error = "Nous n'avons pas pu vérifier le code pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                    }
                }).catch((response) => {
                    formProcessing = false;
                    if (response.response.data.error)
                        error = response.response.data.error;
                    else
                        error = "Nous n'avons pas pu vérifier le code pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                });
                break;
            case 3:
                await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                    action: 'change',
                    email: email,
                    code: code,
                    password: (document.getElementById('rpassword') as HTMLInputElement).value
                }).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/login?toast=' + btoa(JSON.stringify({
                            type: "success",
                            message: 'Votre mot de passe été réinitialisé !',
                            duration: 4000,
                            icon: 'fas fa-check',
                        }));
                    } else {
                        formProcessing = false;
                        if (response.data.error)
                            error = response.data.error;
                        else
                            error = "Nous n'avons pas pu réinitialiser votre mot de passe pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                    }
                }).catch((response) => {
                    formProcessing = false;
                    if (response.response.data.error)
                        error = response.response.data.error;
                    else
                        error = "Nous n'avons pas pu réinitialiser votre mot de passe pour une raison inconue !<br/>Si le problème persiste, contactez le support.";
                });
        }
    }

    function codeInput(n: number, e: KeyboardEvent) {
        if (e.key === 'Backspace') {
            (document.getElementById(`code-${n}`) as HTMLInputElement).value = '';
            if (n > 1) {
                (document.getElementById(`code-${n - 1}`) as HTMLInputElement).focus();
            }
        } else if (e.key.match(/^[0-9]$/)) {
            (document.getElementById(`code-${n}`) as HTMLInputElement).value = e.key;
            if (n < 6) {
                (document.getElementById(`code-${n + 1}`) as HTMLInputElement).focus();
            }
        } else if (e.key === 'ArrowLeft') {
            if (n > 1) {
                (document.getElementById(`code-${n - 1}`) as HTMLInputElement).focus();
            }
        } else if (e.key === 'ArrowRight') {
            if (n < 6) {
                (document.getElementById(`code-${n + 1}`) as HTMLInputElement).focus();
            }
        } else if (e.key === 'v' && e.ctrlKey) {
            if (!navigator.clipboard.readText) return console.error('Clipboard API not available in this browser');
            navigator.clipboard.readText().then((text) => {
                if (text.match(/^[0-9]{6}$/)) {
                    for (let i = 1; i <= 6; i++) {
                        (document.getElementById(`code-${i}`) as HTMLInputElement).value = text[i - 1];
                    }
                }
            });
        }

        let valid = true;
        for (let i = 0; i < 6; i++) {
            if (!(document.getElementById(`code-${i + 1}`) as HTMLInputElement).value.match(/^[0-9]$/)) {
                valid = false;
            }
        }
        if (valid) validForm = true;
        else validForm = false;
    }
</script>

{#if opened}
<div
    class="bg-black bg-opacity-50 absolute top-0 left-0 w-full h-screen z-50"
    on:click={(e) => {
        if (e.target === e.currentTarget) {
            window.history.replaceState({}, '', '/login');
            openedForgotPasswordWrite.set(false);
        }
    }}
    on:keypress={(e) => {
        if (e.key === "Escape") {
            window.history.replaceState({}, '', '/login');
            openedForgotPasswordWrite.set(false);
        }
    }}
>
    <div class="absolute bg-base-100 rounded-lg shadow-lg p-5 sm:p-10 w-1/3 max-xl:w-1/2 max-md:w-5/6 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between">
        <h1 class="text-3xl font-bold text-center">Mot de passe oublié</h1>
        {#if step === 1}
            <p class="text-center mt-2">
                Entrez votre adresse email pour recevoir un code de réinitialisation
            </p>
            <div class="form-control w-full sm:w-2/3 mx-auto mt-10">
                {#if error}
                    <label class="label text-error" for="remail">
                        <span class="text-error text-sm">
                            {@html error}
                        </span>
                    </label>
                {/if}
                <input
                    id="remail"
                    type="email"
                    placeholder="Adresse email"
                    class="input input-bordered {error ? 'input-error' : ''}"
                    disabled={formProcessing}
                    on:keyup={validateForm}
                    on:change={validateForm}
                />
            </div>
        {:else if step === 2}
            <p class="text-center mt-2">
                Entrez le code de réinitialisation reçu par email
            </p>
            <div class="form-control w-full mx-auto mt-10">
                {#if error}
                    <label class="label text-error" for="code">
                        <span class="text-error text-sm">
                            {@html error}
                        </span>
                    </label>
                {/if}
                <div class="flex flex-row items-center w-fit mx-auto">
                    <input
                        id="code-1"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(1, e)}
                    />
                    <input
                        id="code-2"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(2, e)}
                    />
                    <input
                        id="code-3"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(3, e)}
                    />
                    <input
                        id="code-4"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(4, e)}
                    />
                    <input
                        id="code-5"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(5, e)}
                    />
                    <input
                        id="code-6"
                        type="number"
                        maxlength="1"
                        class="code-n w-9 sm:w-12 h-14 mx-1 text-center input input-bordered {error ? 'input-error' : ''}"
                        disabled={formProcessing}
                        on:keydown={(e) => e.preventDefault()}
                        on:keyup={(e) => codeInput(6, e)}
                    />
                </div>
            </div>
        {:else if step === 3}
            <p class="text-center mt-2 mb-10">
                Entrez votre nouveau mot de passe
            </p>
            {#if error}
                <label class="label text-error" for="rpassword">
                    <span class="text-error text-sm">
                        {@html error}
                    </span>
                </label>
            {/if}
            <div class="form-control w-full mx-auto">
                <label class="label" for="rpassword">
                    <span class="label-text">
                        Nouveau mot de passe
                    </span>
                </label>
                <input
                    id="rpassword"
                    type="password"
                    placeholder="••••••••"
                    class="input input-bordered {error ? 'input-error' : ''}"
                    disabled={formProcessing}
                    on:keyup={validateForm}
                    on:change={validateForm}
                />
            </div>
            <div class="form-control w-full mx-auto">
                <label class="label" for="rpassword">
                    <span class="label-text">
                        Confirmer le mot de passe
                    </span>
                </label>
                <input
                    id="rpasswordConfirmation"
                    type="password"
                    placeholder="••••••••"
                    class="input input-bordered {error ? 'input-error' : ''}"
                    disabled={formProcessing}
                    on:keyup={validateForm}
                    on:change={validateForm}
                />
            </div>
        {/if}
        <button
            class="btn btn-secondary w-fit mt-8 mx-auto"
            class:loading={formProcessing}
            disabled={!validForm || formProcessing}
            on:click={process}
        >
            {#if step === 1}
                Envoyer le mail
            {:else if step === 2}
                Suivant
            {:else}
                Réinitialiser le mot de passe
            {/if}
        </button>
    </div>
</div>
{/if}

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
        appearance: initial;
    }

    .code-n {
        padding: 0;
        font-size: 1.5rem;
    }

    @media screen and (max-width: 640px) {
        .code-n {
            font-size: 1rem;
            width: 1.9rem;
            height: 2rem;
        }
    }
</style>
