<script lang="ts">
    import ForgotPassword from "../components/ForgotPassword.svelte";
    import TopLogo from "../components/TopLogo.svelte";
    import { login } from "../utils/auth";
    import { APP_NAME, RESOURCES } from "../utils/constants";
    import { openedForgotPasswordWrite } from "../utils/stores";

    export let forgotPasswordModalOpened = false;
    if (forgotPasswordModalOpened) {
        openedForgotPasswordWrite.set(true);
    }

    openedForgotPasswordWrite.subscribe((value) => {
        forgotPasswordModalOpened = value;
    });

    let btnDisabled = true;
    let formSubmitted = false;
    let error = '';

    function validateForm() {
        btnDisabled = true;

        const user = (document.getElementById("user") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        if (
            user.length > 4 && user.length < 32 &&
            password.length > 8 && password.length < 255 &&
            (user.match(/^[a-zA-Z0-9\-_]+$/) || user.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        ) {
            btnDisabled = false;
        } else {
            btnDisabled = true;
        }
    }
</script>

<ForgotPassword />
<div class="hero min-h-screen bg-base-200">
    <div
        class="opacity-5 w-full h-full absolute top-0 left-0 bg-cover bg-no-repeat"
        style="background-image: url('{RESOURCES.LOGIN_BACKGROUNDS[Math.floor(Math.random() * RESOURCES.LOGIN_BACKGROUNDS.length)]}')"
    ></div>

    <TopLogo />
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left lg:ml-10">
            <h1 class="text-5xl font-bold">Connectez-vous à {APP_NAME}</h1>
            <p class="py-6">
                Connectez-vous à votre compte pour accéder à toutes les fonctionnalités de {APP_NAME}.
            </p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 lg:mr-10">
            <div class="card-body">
                {#if error.length > 0}
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span class="w-full">
                            {error}
                        </span>
                    </div>
                {/if}
                <div class="form-control">
                    <label class="label" for="user">
                        <span class="label-text">Adresse email ou nom d'utilisateur</span>
                    </label>
                    <input
                        type="text"
                        id="user"
                        placeholder="john.doe@example.com"
                        class="input input-bordered"
                        disabled={formSubmitted || forgotPasswordModalOpened}
                        on:keydown={(e) => {
                            if (e.key === "Enter") {
                                document.getElementById("password").focus();
                            }
                        }}
                        on:keyup={validateForm}
                        on:change={validateForm}
                    />
                </div>
                <div class="form-control">
                    <label class="label" for="password">
                        <span class="label-text">Mot de passe</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        class="input input-bordered"
                        disabled={formSubmitted || forgotPasswordModalOpened}
                        on:keydown={(e) => {
                            if (e.key === "Enter") {
                                document.getElementById("submit").click();
                            }
                        }}
                        on:keyup={validateForm}
                        on:change={validateForm}
                    />
                    <label class="label" for="#">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            class="label-text-alt link link-hover"
                            on:click={() => {
                                history.pushState({}, '', '/forgot-password');
                                openedForgotPasswordWrite.set(true);
                            }}
                        >
                            Mot de passe oublié ?
                        </span>
                    </label>
                </div>
                <div class="form-control mt-6">
                    <button
                        id="submit"
                        class="btn btn-primary"
                        disabled={btnDisabled || formSubmitted || forgotPasswordModalOpened}
                        on:click={async () => {
                            formSubmitted = true;
                            // @ts-ignore
                            let response = await login(document.getElementById("user").value, document.getElementById("password").value);
                            if (response === 'ok') {
                                if (localStorage.getItem('redirect'))
                                    window.location.href = localStorage.getItem('redirect');
                                else
                                    window.location.href = "/";
                            } else {
                                if (response === 'invalid-credentials')
                                    error = 'Identifiants invalides';
                                else
                                    error = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';

                                formSubmitted = false;
                            }
                        }}
                    >Se connecter</button>
                </div>
                <p class="py-2 text-center">
                    Vous n'avez pas encore de compte ? <a href="/register" class="link link-primary">Inscrivez-vous</a> dès maintenant !
                </p>
            </div>
        </div>
    </div>
</div>
